'use client';

interface ErrorDisplayProps {
  error: string | null;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-gray-200 border-l-4 border-gray-600 text-gray-800 p-4 rounded">
      <p className="font-medium">{error}</p>
    </div>
  );
}

