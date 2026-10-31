import { DetectionResult, ModelType, SampleImage } from '../types/detection';

/**
 * =========================================================================
 * BACKEND & DATASET INTEGRATION CONFIGURATION
 * =========================================================================
 * Instructions for AI / Backend Teammates:
 * 1. Switch `USE_MOCK_API` to `false` when your inference server is running.
 * 2. Configure `API_BASE_URL` to point to your FastAPI / Flask / Django / Express API.
 * 3. Ensure your endpoint accepts multipart/form-data with 'file' and 'model' params,
 *    and returns JSON matching the `DetectionResult` interface in `../types/detection.ts`.
 * =========================================================================
 */
export const USE_MOCK_API = false;
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

export const INITIAL_DETECTION_RESULT: DetectionResult = {
  id: 'clean-seafloor-initial',
  imageUrl: '/assets/clean-seafloor-sonar.jpg',
  modelName: 'marine-debris',
  status: 'ready',
  timestamp: new Date().toISOString(),
  detectedObjects: [],
  boundingBoxes: [],
  latitude: 13.0827,
  longitude: 80.2707
};

/**
 * Default sample image datasets
 */
export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-1',
    title: 'Seabed Acoustic Sonar Survey',
    thumbnailUrl: '/assets/clean-seafloor-sonar.jpg',
    imageUrl: '/assets/clean-seafloor-sonar.jpg',
    defaultModel: 'marine-debris',
    result: {
      id: 'res-sample-1',
      imageUrl: '/assets/clean-seafloor-sonar.jpg',
      modelName: 'marine-debris',
      status: 'ready',
      inferenceTimeMs: 0,
      timestamp: new Date().toISOString(),
      detectedObjects: [],
      boundingBoxes: [],
      latitude: 13.0827,
      longitude: 80.2707
    }
  },
  {
    id: 'sample-2',
    title: 'Sonar Acoustic Scan (Debris Field)',
    thumbnailUrl: '/assets/sample-2.jpg',
    imageUrl: '/assets/sample-2.jpg',
    defaultModel: 'marine-debris',
    result: {
      id: 'res-sample-2',
      imageUrl: '/assets/sample-2.jpg',
      modelName: 'marine-debris',
      status: 'complete',
      inferenceTimeMs: 115,
      timestamp: new Date().toISOString(),
      detectedObjects: [
        { label: 'Metallic Debris', count: 2, confidence: 89, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' },
        { label: 'Sonar Anomaly', count: 1, confidence: 84, color: 'bg-[#f59e0b]', dotColor: 'bg-[#f59e0b]' }
      ],
      boundingBoxes: [
        {
          id: 'box-s2-1',
          label: 'metallic debris',
          confidence: 0.89,
          color: '#1d72f2',
          x: 35,
          y: 25,
          width: 28,
          height: 38
        }
      ]
    }
  },
  {
    id: 'sample-3',
    title: 'Sunken Fishing Vessel',
    thumbnailUrl: '/assets/sample-3.jpg',
    imageUrl: '/assets/sample-3.jpg',
    defaultModel: 'shipwreck',
    result: {
      id: 'res-sample-3',
      imageUrl: '/assets/sample-3.jpg',
      modelName: 'shipwreck',
      status: 'complete',
      inferenceTimeMs: 168,
      timestamp: new Date().toISOString(),
      detectedObjects: [
        { label: 'Shipwreck Hull', count: 1, confidence: 96, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' },
        { label: 'Wreckage Debris', count: 2, confidence: 88, color: 'bg-[#f59e0b]', dotColor: 'bg-[#f59e0b]' }
      ],
      boundingBoxes: [
        {
          id: 'box-s3-1',
          label: 'shipwreck',
          confidence: 0.96,
          color: '#1d72f2',
          x: 15,
          y: 20,
          width: 65,
          height: 55
        }
      ]
    }
  },
  {
    id: 'sample-4',
    title: 'Reef Wreckage Structure',
    thumbnailUrl: '/assets/sample-4.jpg',
    imageUrl: '/assets/sample-4.jpg',
    defaultModel: 'shipwreck',
    result: {
      id: 'res-sample-4',
      imageUrl: '/assets/sample-4.jpg',
      modelName: 'shipwreck',
      status: 'complete',
      inferenceTimeMs: 150,
      timestamp: new Date().toISOString(),
      detectedObjects: [
        { label: 'Submerged Vessel', count: 1, confidence: 94, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' },
        { label: 'Metal Structure', count: 1, confidence: 85, color: 'bg-[#10b981]', dotColor: 'bg-[#10b981]' }
      ],
      boundingBoxes: [
        {
          id: 'box-s4-1',
          label: 'submerged vessel',
          confidence: 0.94,
          color: '#1d72f2',
          x: 22,
          y: 18,
          width: 58,
          height: 62
        }
      ]
    }
  },
  {
    id: 'sample-5',
    title: 'Coral Reef Entangled Net',
    thumbnailUrl: '/assets/sample-5.jpg',
    imageUrl: '/assets/sample-5.jpg',
    defaultModel: 'multi-class',
    result: {
      id: 'res-sample-5',
      imageUrl: '/assets/sample-5.jpg',
      modelName: 'multi-class',
      status: 'complete',
      inferenceTimeMs: 135,
      timestamp: new Date().toISOString(),
      detectedObjects: [
        { label: 'Ghost Fishing Net', count: 1, confidence: 91, color: 'bg-[#ef4444]', dotColor: 'bg-[#ef4444]' },
        { label: 'Plastic Bottle', count: 1, confidence: 84, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' }
      ],
      boundingBoxes: [
        {
          id: 'box-s5-1',
          label: 'ghost net',
          confidence: 0.91,
          color: '#ef4444',
          x: 25,
          y: 22,
          width: 50,
          height: 52
        }
      ]
    }
  },
  {
    id: 'sample-6',
    title: 'Deep Abyss Sonar Target',
    thumbnailUrl: '/assets/sample-6.jpg',
    imageUrl: '/assets/sample-6.jpg',
    defaultModel: 'shipwreck',
    result: {
      id: 'res-sample-6',
      imageUrl: '/assets/sample-6.jpg',
      modelName: 'shipwreck',
      status: 'complete',
      inferenceTimeMs: 172,
      timestamp: new Date().toISOString(),
      detectedObjects: [
        { label: 'Sunken Keel', count: 1, confidence: 95, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' }
      ],
      boundingBoxes: [
        {
          id: 'box-s6-1',
          label: 'sunken keel',
          confidence: 0.95,
          color: '#1d72f2',
          x: 20,
          y: 24,
          width: 60,
          height: 50
        }
      ]
    }
  }
];

/**
 * Execute detection prediction on an image file or URL
 */
export async function runDetectionInference(
  imageSource: string | File,
  modelType: ModelType = 'marine-debris',
  confidence: number = 0.25,
  latitude?: number | null,
  longitude?: number | null
): Promise<DetectionResult> {
  // If Mock API is active:
  if (USE_MOCK_API) {
    await new Promise((resolve) => setTimeout(resolve, 850));
    if (typeof imageSource === 'string') {
      const match = SAMPLE_IMAGES.find(s => s.imageUrl === imageSource || s.thumbnailUrl === imageSource);
      if (match) {
        return {
          ...match.result,
          modelName: modelType,
          latitude: latitude ?? match.result.latitude ?? null,
          longitude: longitude ?? match.result.longitude ?? null,
          timestamp: new Date().toISOString()
        };
      }
    }
    const imagePreviewUrl = typeof imageSource === 'string'
      ? imageSource
      : URL.createObjectURL(imageSource);

    return {
      id: `custom-${Date.now()}`,
      imageUrl: imagePreviewUrl,
      modelName: modelType,
      status: 'complete',
      inferenceTimeMs: 140 + Math.floor(Math.random() * 50),
      timestamp: new Date().toISOString(),
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      detectedObjects: [
        { label: 'Subsea Debris', count: 1, confidence: 88, color: 'bg-[#1d72f2]', dotColor: 'bg-[#1d72f2]' },
      ],
      boundingBoxes: [
        {
          id: 'box-c1',
          label: 'subsea debris',
          confidence: 0.88,
          color: '#1d72f2',
          x: 35,
          y: 30,
          width: 25,
          height: 35,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        }
      ]
    };
  }

  // Real backend call
  if (typeof imageSource !== 'string') {
    return runLiveDetection(imageSource, confidence, modelType, latitude, longitude);
  }
  const blob = await fetch(imageSource).then(r => r.blob());
  const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
  return runLiveDetection(file, confidence, modelType, latitude, longitude);
}

const DISPLAY_LABEL: Record<string, string> = {
  Pipeline: 'Pipeline',
  marine_debris: 'Possible Marine Debris',
  crab_pot: 'Possible Crab Pot',
};

const CLASS_COLORS: Record<string, { color: string; dotColor: string }> = {
  Pipeline: { color: '#14b8a6', dotColor: 'bg-[#14b8a6]' },
  marine_debris: { color: '#ef4444', dotColor: 'bg-[#ef4444]' },
  crab_pot: { color: '#f59e0b', dotColor: 'bg-[#f59e0b]' },
  default: { color: '#1d72f2', dotColor: 'bg-[#1d72f2]' },
};

const SOURCE_LABEL: Record<string, string> = {
  multiclass: 'Multiclass AI',
  pipeline_specialist: 'Pipeline specialist',
};

interface DeepScanDetection {
  id: string;
  class_name: string;
  confidence: number;
  source: string;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  latitude?: number | null;
  longitude?: number | null;
}

async function runLiveDetection(
  file: File,
  confidence: number,
  modelType: ModelType,
  latitude?: number | null,
  longitude?: number | null
): Promise<DetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', String(confidence));
  if (latitude !== undefined && latitude !== null) {
    formData.append('latitude', String(latitude));
  }
  if (longitude !== undefined && longitude !== null) {
    formData.append('longitude', String(longitude));
  }

  const response = await fetch(`${API_BASE_URL}/detect`, { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`Inference API error: ${response.statusText}`);
  }
  const data: {
    image: string;
    width: number;
    height: number;
    detections: DeepScanDetection[];
    inference_ms: number;
    latitude?: number | null;
    longitude?: number | null;
  } = await response.json();

  const finalLat = data.latitude !== undefined && data.latitude !== null ? data.latitude : (latitude ?? null);
  const finalLng = data.longitude !== undefined && data.longitude !== null ? data.longitude : (longitude ?? null);

  // "Marine Debris" card -> pipeline specialist model only.
  // "Multi-Class" card -> the crab-pot/marine-debris multiclass model only.
  // "Shipwreck" card has no dedicated model in the current lineup, so it shows everything.
  const filteredDetections = data.detections.filter((d) => {
    if (modelType === 'marine-debris') return d.source === 'pipeline_specialist';
    if (modelType === 'multi-class') return d.source === 'multiclass';
    return true;
  });

  const boundingBoxes = filteredDetections.map((d, i) => {
    const colors = CLASS_COLORS[d.class_name] ?? CLASS_COLORS.default;
    return {
      id: `box-${i}`,
      label: `${DISPLAY_LABEL[d.class_name] ?? d.class_name} \u00b7 ${SOURCE_LABEL[d.source] ?? d.source}`,
      confidence: d.confidence,
      color: colors.color,
      x: (d.bbox.x1 / data.width) * 100,
      y: (d.bbox.y1 / data.height) * 100,
      width: ((d.bbox.x2 - d.bbox.x1) / data.width) * 100,
      height: ((d.bbox.y2 - d.bbox.y1) / data.height) * 100,
      latitude: finalLat,
      longitude: finalLng,
    };
  });

  const counts = new Map<string, { count: number; confSum: number }>();
  for (const d of filteredDetections) {
    const name = DISPLAY_LABEL[d.class_name] ?? d.class_name;
    const entry = counts.get(name) ?? { count: 0, confSum: 0 };
    entry.count += 1;
    entry.confSum += d.confidence;
    counts.set(name, entry);
  }
  const detectedObjects = Array.from(counts.entries()).map(([name, { count, confSum }]) => {
    const rawClass = Object.keys(DISPLAY_LABEL).find(k => DISPLAY_LABEL[k] === name) ?? name;
    const colors = CLASS_COLORS[rawClass] ?? CLASS_COLORS.default;
    return { label: name, count, confidence: Math.round((confSum / count) * 100), color: colors.color, dotColor: colors.dotColor };
  });

  return {
    id: `det-${Date.now()}`,
    imageUrl: data.image,
    modelName: 'multi-class',
    status: 'complete',
    detectedObjects,
    boundingBoxes,
    inferenceTimeMs: data.inference_ms,
    timestamp: new Date().toISOString(),
    latitude: finalLat,
    longitude: finalLng,
  };
}
