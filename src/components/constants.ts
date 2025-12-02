export const MODEL_CLASSES = [
  'helmet',
  'gloves',
  'vest',
  'boots',
  'goggles',
  'none',
  'Person',
  'no_helmet',
  'no_goggle',
  'no_gloves',
  'no_boots',
] as const;

export const DEFAULT_KOREAN_LABELS: Record<string, string> = {
  'helmet': '헬멧',
  'gloves': '장갑',
  'vest': '조끼',
  'boots': '부츠',
  'goggles': '고글',
  'none': '없음',
  'Person': '사람',
  'no_helmet': '헬멧 미착용',
  'no_goggle': '고글 미착용',
  'no_gloves': '장갑 미착용',
  'no_boots': '부츠 미착용',
};

