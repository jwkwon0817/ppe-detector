'use client';

import { Detection } from './types';
import { getKoreanLabel, filterEnabledDetections } from './utils';

interface DetectionResultsProps {
  detections: Detection[];
  enabledClasses: Record<string, boolean>;
}

export default function DetectionResults({
  detections,
  enabledClasses,
}: DetectionResultsProps) {
  const filteredDetections = filterEnabledDetections(detections, enabledClasses);

  if (filteredDetections.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        감지 결과
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <p className="text-sm text-gray-600 mb-3">
          총 <span className="font-bold text-gray-800">{filteredDetections.length}</span>개 감지됨
        </p>
        {filteredDetections.map((det, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-gray-100 border border-gray-200"
          >
            <div className="font-semibold text-gray-800">
              {getKoreanLabel(det.class)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              신뢰도: <span className="font-medium">{(det.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {det.class}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

