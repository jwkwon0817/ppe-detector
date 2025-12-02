'use client';

import { MODEL_CLASSES, DEFAULT_KOREAN_LABELS } from './constants';

interface ClassTogglePanelProps {
  enabledClasses: Record<string, boolean>;
  onToggleClass: (className: string) => void;
}

export default function ClassTogglePanel({
  enabledClasses,
  onToggleClass,
}: ClassTogglePanelProps) {
  const enabledCount = Object.values(enabledClasses).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        감지 클래스 설정
      </h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {MODEL_CLASSES.map((className) => (
          <button
            key={className}
            onClick={() => onToggleClass(className)}
            className={`w-full text-left px-4 py-2 rounded-lg transition font-medium cursor-pointer ${
              enabledClasses[className]
                ? 'bg-gray-800 text-gray-100 shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span>{DEFAULT_KOREAN_LABELS[className] || className}</span>
                <span className={`text-xs mt-1 ${
                  enabledClasses[className] ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {className}
                </span>
              </div>
              <span className={`text-xs ${
                enabledClasses[className] ? 'text-gray-300' : 'text-gray-400'
              }`}>
                {enabledClasses[className] ? 'ON' : 'OFF'}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          활성화된 클래스: <span className="font-bold text-gray-800">{enabledCount}</span>개
        </p>
      </div>
    </div>
  );
}

