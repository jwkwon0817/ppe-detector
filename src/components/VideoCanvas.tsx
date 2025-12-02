'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Detection } from './types';
import { filterEnabledDetections, getKoreanLabel } from './utils';

import { VideoSkeleton } from './Skeleton';

const CLASS_COLORS: Record<string, string> = {
  helmet: '#3B82F6',
  gloves: '#10B981',    // Emerald 500
  vest: '#8B5CF6',      // Violet 500
  boots: '#06B6D4',     // Cyan 500
  goggles: '#6366F1',   // Indigo 500
  
  // 미착용 (위험 - Red/Orange 계열)
  no_helmet: '#EF4444', // Red 500
  no_goggle: '#F97316', // Orange 500
  no_gloves: '#F59E0B', // Amber 500
  no_boots: '#EC4899',  // Pink 500
  
  // 기타
  Person: '#94A3B8',    // Slate 400
  none: '#CBD5E1',      // Slate 300
};

const DEFAULT_COLOR = '#64748B'; // Slate 500

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
        const color = CLASS_COLORS[className] || DEFAULT_COLOR;
        
        const x = bbox.x1;
        const y = bbox.y1;
        const w = bbox.x2 - bbox.x1;
        const h = bbox.y2 - bbox.y1;

        // 1. 바운딩 박스 그리기
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, 8);
        } else {
          ctx.rect(x, y, w, h);
        }
        
        // 박스 내부 채우기 (투명도 10%)
        ctx.fillStyle = `${color}1A`; 
        ctx.fill();
        
        // 박스 테두리
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 2. 라벨 그리기
        const label = `${koreanLabel} ${(confidence * 100).toFixed(0)}%`;
        
        // 폰트 설정
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const textMetrics = ctx.measureText(label);
        
        const textPaddingX = 8;
        const textWidth = textMetrics.width;
        const labelHeight = 24;
        
        // 라벨 위치 계산 (박스 왼쪽 상단, 공간 없으면 안쪽으로)
        const labelX = x;
        let labelY = y - labelHeight - 4;
        if (labelY < 0) {
          labelY = y + 4;
        }

        // 라벨 배경 그리기 (둥근 모서리)
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(labelX, labelY, textWidth + (textPaddingX * 2), labelHeight, 6);
        } else {
          ctx.rect(labelX, labelY, textWidth + (textPaddingX * 2), labelHeight);
        }
        ctx.fillStyle = color;
        ctx.fill();
        
        // 라벨 텍스트 그리기
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelX + textPaddingX, labelY + (labelHeight / 2) + 1);
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

