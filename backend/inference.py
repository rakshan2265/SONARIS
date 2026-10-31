"""
SONARIS - inference wrapper.

Runs the two-model pipeline described in the SIH 26057 model handoff spec:
  1. Main multiclass detector  (Pipeline / Shipwreck / GhostNet / Mine)
  2. Pipeline specialist       (Pipeline only - a second opinion, kept separate)

The two outputs are NEVER merged/fused automatically (spec section 9) - the
API and CLI both return them as two distinct lists so a human (or a future,
explicit fusion policy) makes the call, not a silent override.

CLI usage:
    python inference.py "path/to/sonar_image.png"
    python inference.py "path/to/sonar_image.png" --conf 0.25 --pipeline-conf 0.25
    python inference.py "path/to/sonar_image.png" --conf 0.001 --pipeline-conf 0.001   # diagnostic only

This module intentionally knows nothing about FastAPI/HTTP - app.py imports
run_inference() and wraps it for the web API. Keeping this separate means the
model logic can be tested/run from the command line on its own.
"""
import argparse
import os
import yaml
from PIL import Image
from ultralytics import YOLO

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.yaml")


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


class InferenceEngine:
    """Loads both models once (per spec: never reload per-request) and runs them."""

    def __init__(self, config=None):
        self.config = config or load_config()
        base_dir = os.path.dirname(__file__)

        self.multiclass_names = self.config["classes"]["multiclass"]
        self.pipeline_names = self.config["classes"]["pipeline_specialist"]

        self.multiclass_model = self._safe_load(
            os.path.join(base_dir, self.config["models"]["multiclass"]), "multiclass"
        )
        self.pipeline_model = self._safe_load(
            os.path.join(base_dir, self.config["models"]["pipeline_specialist"]), "pipeline_specialist"
        )

    def _safe_load(self, path, name):
        if not os.path.isfile(path):
            print(f"[WARNING] {name} model not found at {path} - "
                  f"that head will return no detections until the .pt file is placed there.")
            return None
        model = YOLO(path)
        print(f"[OK] Loaded {name} model from {path}")
        return model

    def _run_one(self, model, class_names, image, conf, iou, imgsz, source_tag):
        if model is None:
            return []
        results = model.predict(image, conf=conf, iou=iou, imgsz=imgsz, verbose=False)[0]
        out = []
        for box in results.boxes:
            class_id = int(box.cls[0])
            # class_id -> name comes ONLY from the fixed config map (spec section 2/6),
            # never from model.names, so IDs can never silently drift/reorder.
            class_name = class_names.get(class_id, f"unknown-{class_id}")
            x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
            out.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(float(box.conf[0]), 4),
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
                "source": source_tag,
            })
        return out

    def run(self, image, conf=None, pipeline_conf=None, iou=None, imgsz=None):
        """image: PIL.Image or path. Returns the spec-section-10 JSON contract."""
        if isinstance(image, str):
            image = Image.open(image).convert("RGB")

        cfg = self.config["inference"]
        conf = cfg["confidence"] if conf is None else conf
        pipeline_conf = cfg["pipeline_confidence"] if pipeline_conf is None else pipeline_conf
        iou = cfg["iou"] if iou is None else iou
        imgsz = cfg["imgsz"] if imgsz is None else imgsz

        detections = self._run_one(
            self.multiclass_model, self.multiclass_names, image, conf, iou, imgsz, "multiclass"
        )
        pipeline_specialist = self._run_one(
            self.pipeline_model, self.pipeline_names, image, pipeline_conf, iou, imgsz, "pipeline_specialist"
        )
        return {"detections": detections, "pipeline_specialist": pipeline_specialist}


# Module-level singleton so app.py and the CLI both reuse one loaded engine.
_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = InferenceEngine()
    return _engine


def run_inference(image, conf=None, pipeline_conf=None, iou=None, imgsz=None):
    return get_engine().run(image, conf=conf, pipeline_conf=pipeline_conf, iou=iou, imgsz=imgsz)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SONARIS - standalone sonar inference")
    parser.add_argument("image_path", help="Path to a side-scan sonar image")
    parser.add_argument("--conf", type=float, default=None, help="Multiclass confidence (default from config.yaml, 0.25)")
    parser.add_argument("--pipeline-conf", type=float, default=None, help="Pipeline specialist confidence (default 0.25)")
    args = parser.parse_args()

    result = run_inference(args.image_path, conf=args.conf, pipeline_conf=args.pipeline_conf)
    result["image"] = os.path.basename(args.image_path)

    import json
    print(json.dumps(result, indent=2))
