export interface Detection {
  class: string;
  class_id: number;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface DetectionResult {
  success?: boolean;
  detections: Detection[];
  count?: number;
  error?: string;
}

