import { DEFAULT_KOREAN_LABELS } from './constants';
import { Detection } from './types';

export const getKoreanLabel = (className: string): string => {
  const normalizedClass = className.toLowerCase();
  if (DEFAULT_KOREAN_LABELS[normalizedClass]) {
    return DEFAULT_KOREAN_LABELS[normalizedClass];
  }
  const matchedKey = Object.keys(DEFAULT_KOREAN_LABELS).find(key => 
    normalizedClass.includes(key) || key.includes(normalizedClass)
  );
  return matchedKey ? DEFAULT_KOREAN_LABELS[matchedKey] : className;
};

export const filterEnabledDetections = (
  allDetections: Detection[],
  enabledClasses: Record<string, boolean>
): Detection[] => {
  const enabledClassNames = Object.entries(enabledClasses)
    .filter(([, enabled]) => enabled)
    .map(([className]) => className.toLowerCase());

  if (enabledClassNames.length === 0) {
    return [];
  }

  return allDetections.filter(det => {
    const detectionClass = det.class.toLowerCase();
    return enabledClassNames.some(enabledClass => 
      detectionClass.includes(enabledClass) || 
      enabledClass.includes(detectionClass)
    );
  });
};

