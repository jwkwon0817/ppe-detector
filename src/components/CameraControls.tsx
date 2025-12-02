'use client';

import { ButtonSkeleton } from './Skeleton';

interface CameraControlsProps {
  isStreaming: boolean;
  isDetecting: boolean;
  isLoading?: boolean;
  isDetectingLoading?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onToggleDetection: () => void;
}

export default function CameraControls({
  isStreaming,
  isDetecting,
  isLoading = false,
  isDetectingLoading = false,
  onStartCamera,
  onStopCamera,
  onToggleDetection,
}: CameraControlsProps) {
  if (isLoading) {
    return <ButtonSkeleton />;
  }

  return (
    <div className="flex gap-3 justify-center">
      {!isStreaming ? (
        <button
          onClick={onStartCamera}
          disabled={isLoading}
          className="px-8 py-3 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition font-medium border border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          카메라 시작
        </button>
      ) : (
        <>
          <button
            onClick={onStopCamera}
            className="px-8 py-3 bg-gray-600 text-gray-100 rounded-lg hover:bg-gray-500 transition font-medium border border-gray-300 cursor-pointer"
          >
            카메라 중지
          </button>
          <button
            onClick={onToggleDetection}
            disabled={isDetectingLoading}
            className={`px-8 py-3 rounded-lg transition font-medium border border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative ${
              isDetecting
                ? 'bg-gray-400 text-gray-100 hover:bg-gray-500'
                : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
            }`}
          >
            {isDetectingLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              </span>
            )}
            <span className={isDetectingLoading ? 'invisible' : ''}>
              {isDetecting ? '감지 중지' : '감지 시작'}
            </span>
          </button>
        </>
      )}
    </div>
  );
}

