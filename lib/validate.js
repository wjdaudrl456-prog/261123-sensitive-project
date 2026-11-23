import { AppError } from './errors.js';

export const MAX_LENGTH = 1000;

// 입력값을 검사하고, 통과하면 앞뒤 공백을 제거한 문자열을 돌려준다
export function validateText(value) {
  if (typeof value !== 'string') throw new AppError('INVALID_REQUEST');
  if (value.trim().length === 0) throw new AppError('EMPTY_TEXT');
  if (value.length > MAX_LENGTH) throw new AppError('TEXT_TOO_LONG');
  return value.trim();
}
