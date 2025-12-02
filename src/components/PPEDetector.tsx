'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CameraControls from './CameraControls';
import ClassTogglePanel from './ClassTogglePanel';
import { MODEL_CLASSES } from './constants';
import DetectionResults from './DetectionResults';
import ErrorDisplay from './ErrorDisplay';
import { useCamera } from './hooks/useCamera';
import { useDetection } from './hooks/useDetection';
import VideoCanvas from './VideoCanvas';

export default function PPEDetector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    videoRef,
    isStreaming,
    isLoading: isCameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  const {
    isDetecting,
    isDetectingLoading,
    detections,
    error: detectionError,
    setIsDetecting,
    stopDetection,
  } = useDetection(videoRef, canvasRef, isStreaming);

  const [enabledClasses, setEnabledClasses] = useState<Record<string, boolean>>(
    MODEL_CLASSES.reduce((acc, className) => {
      acc[className] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleClass = useCallback((className: string) => {
    setEnabledClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  }, []);

  const handleStopCamera = useCallback(() => {
    stopCamera();
    stopDetection();
  }, [stopCamera, stopDetection]);

  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, [handleStopCamera]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const error = cameraError || detectionError;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          PPE Detection Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoCanvas
              videoRef={videoRef}
              canvasRef={canvasRef}
              isStreaming={isStreaming}
              isLoading={isCameraLoading}
              detections={detections}
              enabledClasses={enabledClasses}
            />

            <CameraControls
              isStreaming={isStreaming}
              isDetecting={isDetecting}
              isLoading={isCameraLoading}
              isDetectingLoading={isDetectingLoading}
              onStartCamera={startCamera}
              onStopCamera={handleStopCamera}
              onToggleDetection={() => setIsDetecting(!isDetecting)}
            />

            <ErrorDisplay error={error} />
          </div>

          <div className="space-y-4">
            <ClassTogglePanel
              enabledClasses={enabledClasses}
              onToggleClass={toggleClass}
            />

            <DetectionResults
              detections={detections}
              enabledClasses={enabledClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
