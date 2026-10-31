"""
SONARIS - Backend API
PS 26057 - AI-Powered Automated Underwater Marine Debris and Anomaly Detection

Thin API layer over inference.py's two-model engine (main multiclass detector +
pipeline specialist). Response contract is intentionally simple - the frontend
does the display formatting itself.
"""
import time
import io
import base64
import uuid
from typing import Any, Dict, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from inference import run_inference, get_engine

app = FastAPI(title="SONARIS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load both models once at startup, not per-request.
engine = get_engine()

# In-memory store for geo-tagged detections (frontend's Live Map / geolocation
# service). Not persisted across restarts - fine for an MVP/demo.
GEO_DETECTIONS: List[Dict[str, Any]] = []


@app.get("/api/health")
def health():
    return {
        "status": "ready",
        "multiclass_loaded": engine.multiclass_model is not None,
        "pipeline_specialist_loaded": engine.pipeline_model is not None,
        "multiclass_classes": list(engine.multiclass_names.values()),
        "pipeline_specialist_classes": list(engine.pipeline_names.values()),
    }


@app.post("/api/detect")
async def detect(
    file: UploadFile = File(...),
    confidence: float = Form(0.25),
    latitude: float = Form(None),
    longitude: float = Form(None),
):
    """
    Runs both models on the uploaded sonar image. Detections from the two
    models are returned in a single flat list, each tagged with its source -
    they are never silently merged/fused into one "final" call.
    """
    start = time.time()
    try:
        image_bytes = await file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = pil_image.size
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    result = run_inference(pil_image, conf=confidence, pipeline_conf=confidence)
    inference_ms = round((time.time() - start) * 1000, 1)

    detections = []
    for det in result["detections"] + result["pipeline_specialist"]:
        detections.append({
            "id": str(uuid.uuid4())[:8],
            "class_name": det["class_name"],
            "confidence": det["confidence"],
            "source": det["source"],
            "bbox": det["bbox"],
            "latitude": latitude,
            "longitude": longitude,
        })

    buf = io.BytesIO()
    pil_image.save(buf, format="JPEG", quality=85)
    image_data_url = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

    return {
        "image": image_data_url,
        "width": width,
        "height": height,
        "detections": detections,
        "inference_ms": inference_ms,
        "latitude": latitude,
        "longitude": longitude,
    }


@app.get("/api/detections")
def list_geo_detections():
    """Returns all geo-tagged detections saved so far (frontend's Live Map)."""
    return GEO_DETECTIONS


@app.post("/api/detections")
async def create_geo_detection(request: Request):
    """
    Saves a geo-tagged detection. Accepts whatever shape the frontend sends
    (it already builds id/timestamp client-side) rather than a strict schema,
    since the Live Map view attaches extra optional fields (depth, notes, etc).
    """
    body: Dict[str, Any] = await request.json()
    if not body.get("id"):
        body["id"] = str(uuid.uuid4())[:8]
    if not body.get("timestamp"):
        body["timestamp"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    GEO_DETECTIONS.insert(0, body)
    return body


if __name__ == "__main__":
    import uvicorn
    print("Starting SONARIS Backend on http://localhost:8000 ...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
