export type ModelType = 'marine-debris' | 'shipwreck' | 'multi-class';

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  color: string;
  // Normalized coordinates (percentages 0-100) for responsive scaling
  x: number;
  y: number;
  width: number;
  height: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DetectedObjectSummary {
  label: string;
  count: number;
  confidence: number; // 0 to 100 percentage
  color: string;      // Tailwind / hex color for progress bar
  dotColor: string;   // Tailwind / hex color for indicator dot
}

export interface DetectionResult {
  id: string;
  imageUrl: string;
  modelName: ModelType;
  status: 'ready' | 'processing' | 'complete' | 'error';
  detectedObjects: DetectedObjectSummary[];
  boundingBoxes: BoundingBox[];
  inferenceTimeMs?: number;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface SampleImage {
  id: string;
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  defaultModel: ModelType;
  result: DetectionResult;
}
