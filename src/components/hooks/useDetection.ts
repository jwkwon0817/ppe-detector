'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { Detection } from '../types';

export const useDetection = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isStreaming: boolean
) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDetectingLoading, setIsDetectingLoading] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isDetectingRef = useRef(false);
  const lastDetectionTimeRef = useRef<number>(0);
  const detectFrameRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const detectFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isDetectingRef.current) {
      return;
    }

    const video = videoRef.current;
    const ctx = canvasRef.current.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(() => {
        if (isDetectingRef.current) {
          detectFrameRef.current?.();
        }
      });
      return;
    }

    const now = Date.now();
    const timeSinceLastDetection = now - lastDetectionTimeRef.current;
    if (timeSinceLastDetection < 300) {
      requestAnimationFrame(() => {
        if (isDetectingRef.current) {
          detectFrameRef.current?.();
        }
      });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      requestAnimationFrame(() => {
        if (isDetectingRef.current) {
          detectFrameRef.current?.();
        }
      });
      return;
    }

    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // 이미지를 Blob으로 변환
    tempCanvas.toBlob(async (blob) => {
      if (!blob || !isDetectingRef.current) return;

      lastDetectionTimeRef.current = Date.now();

      try {
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');

        const response = await fetch('/api/detect', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current?.signal,
        });

        if (!isDetectingRef.current) return;

        const result = await response.json();

        if (result.error) {
          if (!abortControllerRef.current?.signal.aborted) {
            setError(result.error);
          }
        } else if (result.success !== false) {
          setDetections(result.detections || []);
          setError(null);
          setIsDetectingLoading(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (isDetectingRef.current && !abortControllerRef.current?.signal.aborted) {
          setError(`감지 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      // 다음 프레임 감지
      if (isDetectingRef.current) {
        requestAnimationFrame(() => {
          if (isDetectingRef.current) {
            detectFrameRef.current?.();
          }
        });
      }
    }, 'image/jpeg', 0.85);
  }, [videoRef, canvasRef]);

  useEffect(() => {
    detectFrameRef.current = detectFrame;
  }, [detectFrame]);

  useEffect(() => {
    isDetectingRef.current = isDetecting;
    
    if (isDetecting && isStreaming) {
      startTransition(() => {
        setIsDetectingLoading(true);
      });
      lastDetectionTimeRef.current = 0;
      detectFrame();
      setTimeout(() => {
        startTransition(() => {
          setIsDetectingLoading(false);
        });
      }, 500);
    } else {
      startTransition(() => {
        setIsDetectingLoading(false);
      });
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [isDetecting, isStreaming, detectFrame]);

  const stopDetection = useCallback(() => {
    isDetectingRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDetecting(false);
    setDetections([]);
  }, []);

  return {
    isDetecting,
    isDetectingLoading,
    detections,
    error,
    setIsDetecting,
    stopDetection,
  };
};

