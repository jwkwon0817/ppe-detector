'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Detection } from './types';
import { filterEnabledDetections, getKoreanLabel } from './utils';

import { VideoSkeleton } from './Skeleton';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading?: boolean;
  detections: Detection[];
  enabledClasses: Record<string, boolean>;
}

export default function VideoCanvas({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading = false,
  detections,
  enabledClasses,
}: VideoCanvasProps) {
  const animationFrameRef = useRef<number | null>(null);
  const renderVideoRef = useRef<() => void>(() => {});

  const renderVideo = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true
    });

    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(renderVideoRef.current);
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(renderVideoRef.current);
      return;
    }

    // 캔버스 크기 설정
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // 비디오 프레임을 캔버스에 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 활성화된 클래스에 해당하는 감지 결과만 필터링
    const filteredDetections = filterEnabledDetections(detections, enabledClasses);

    // 감지 결과를 바운딩 박스로 그리기
    if (filteredDetections.length > 0) {
      ctx.save();
      
      filteredDetections.forEach((det) => {
        const { bbox, class: className, confidence } = det;
        const koreanLabel = getKoreanLabel(className);
        
        // 바운딩 박스 그리기 (grayscale 톤 - 어두운 회색)
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 3;
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);

        // 라벨 배경 그리기
        ctx.fillStyle = '#2a2a2a';
        ctx.font = 'bold 16px Arial';
        const label = `${koreanLabel} ${(confidence * 100).toFixed(1)}%`;
        const textMetrics = ctx.measureText(label);
        const labelHeight = 22;
        const labelY = Math.max(bbox.y1, labelHeight);
        ctx.fillRect(bbox.x1, labelY - labelHeight, textMetrics.width + 12, labelHeight);

        // 라벨 텍스트 그리기
        ctx.fillStyle = '#e5e5e5';
        ctx.fillText(label, bbox.x1 + 6, labelY - 5);
      });
      
      ctx.restore();
    }

    // 다음 프레임 렌더링
    animationFrameRef.current = requestAnimationFrame(renderVideoRef.current);
  }, [isStreaming, detections, enabledClasses, videoRef, canvasRef]);

  // renderVideo ref 업데이트
  useEffect(() => {
    renderVideoRef.current = renderVideo;
  }, [renderVideo]);

  // 비디오 렌더링 루프
  useEffect(() => {
    if (isStreaming) {
      animationFrameRef.current = requestAnimationFrame(renderVideoRef.current);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
        style={{ width: '1px', height: '1px' }}
      />
      
      {isLoading ? (
        <VideoSkeleton />
      ) : !isStreaming ? (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          <p className="text-gray-400 text-sm">카메라를 시작해주세요</p>
        </div>
      ) : (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg"
            style={{ display: 'block', minHeight: '400px', backgroundColor: '#000' }}
          />
        </div>
      )}
    </div>
  );
}

