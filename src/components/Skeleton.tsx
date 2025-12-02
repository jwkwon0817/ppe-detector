'use client';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-300 rounded ${className}`}
      style={{ width, height }}
    />
  );
}

export function VideoSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">카메라 초기화 중...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="flex gap-3 justify-center">
      <Skeleton className="h-12 w-32 rounded-lg" />
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <Skeleton className="h-7 w-40 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

