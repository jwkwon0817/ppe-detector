'use client';

import { useCallback, useRef, useState } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        }
      });
      
      let retries = 0;
      const maxRetries = 10;
      while (!videoRef.current && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const video = videoRef.current;
        let resolved = false;
        
        if (video.readyState >= video.HAVE_METADATA) {
          setIsStreaming(true);
          setIsLoading(false);
          return;
        }

        const onLoadedMetadata = () => {
          if (!resolved) {
            resolved = true;
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            setIsStreaming(true);
            setIsLoading(false);
          }
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            setIsStreaming(true);
            setIsLoading(false);
          }
        }, 3000);
      } else {
        setError('비디오 요소를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
        setIsLoading(false);
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      setError(`카메라 접근 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsStreaming(false);
      setIsLoading(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
  };
};
