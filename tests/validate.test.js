import test from 'node:test';
import assert from 'node:assert/strict';
import { validateText, MAX_LENGTH } from '../lib/validate.js';
import { AppError } from '../lib/errors.js';

test('V-01: 정상 문자열 입력 검증 통과', () => {
  const res = validateText('좋아요');
  assert.equal(res, '좋아요');
});

test('V-02: 앞뒤 공백 제거(trim) 확인', () => {
  const res = validateText('  좋아요  ');
  assert.equal(res, '좋아요');
});

test('V-03: 빈 문자열 입력 시 EMPTY_TEXT 오류', () => {
  assert.throws(
    () => validateText(''),
    (err) => err instanceof AppError && err.code === 'EMPTY_TEXT'
  );
});

test('V-04: 공백/개행/탭만 있는 경우 EMPTY_TEXT 오류', () => {
  assert.throws(
    () => validateText('   \n\t '),
    (err) => err instanceof AppError && err.code === 'EMPTY_TEXT'
  );
});

test('V-05: 정확히 1,000자 입력 시 통과', () => {
  const text = '가'.repeat(MAX_LENGTH);
  const res = validateText(text);
  assert.equal(res, text);
});

test('V-06: 1,001자 입력 시 TEXT_TOO_LONG 오류', () => {
  const text = '가'.repeat(MAX_LENGTH + 1);
  assert.throws(
    () => validateText(text),
    (err) => err instanceof AppError && err.code === 'TEXT_TOO_LONG'
  );
});

test('V-07: 문자열이 아닌 타입 입력 시 INVALID_REQUEST 오류', () => {
  const invalidValues = [undefined, 123, null, {}, [], true];
  for (const val of invalidValues) {
    assert.throws(
      () => validateText(val),
      (err) => err instanceof AppError && err.code === 'INVALID_REQUEST'
    );
  }
});
