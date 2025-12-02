import { Detection } from './types';
import { DEFAULT_KOREAN_LABELS } from './constants';

export const getKoreanLabel = (className: string): string => {
  const normalizedClass = className.toLowerCase();
  // 정확히 일치하는 경우
  if (DEFAULT_KOREAN_LABELS[normalizedClass]) {
    return DEFAULT_KOREAN_LABELS[normalizedClass];
  }
  // 부분 일치하는 경우 찾기
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

