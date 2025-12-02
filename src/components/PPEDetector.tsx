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
  
  // 카메라 훅
  const {
    videoRef,
    isStreaming,
    isLoading: isCameraLoading,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera();

  // 감지 훅
  const {
    isDetecting,
    isDetectingLoading,
    detections,
    error: detectionError,
    setIsDetecting,
    stopDetection,
  } = useDetection(videoRef, canvasRef, isStreaming);

  // 각 클래스별 토글 상태
  const [enabledClasses, setEnabledClasses] = useState<Record<string, boolean>>(
    MODEL_CLASSES.reduce((acc, className) => {
      acc[className] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // 클래스 토글 핸들러
  const toggleClass = useCallback((className: string) => {
    setEnabledClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  }, []);

  // 카메라 중지 시 감지도 중지
  const handleStopCamera = useCallback(() => {
    stopCamera();
    stopDetection();
  }, [stopCamera, stopDetection]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, [handleStopCamera]);

  // 페이지 로드 시 스크롤을 맨 위로 고정
  useEffect(() => {
    window.scrollTo(0, 0);
    // 히스토리 API를 사용하여 스크롤 위치 저장 방지
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
          {/* 왼쪽: 카메라 및 컨트롤 */}
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

          {/* 오른쪽: 클래스 토글 및 감지 결과 */}
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
