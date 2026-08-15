import { describe, expect, it } from 'vitest';
import { parseWake } from '../src/modules/line/wake';

describe('LINE wake parser', () => {
  it('stays silent on ordinary club chat', () => {
    expect(parseWake('ถึงไหนแล้ว')).toBeNull();
    expect(parseWake('เจอกันที่ด่าน')).toBeNull();
    expect(parseWake('')).toBeNull();
  });

  it('wakes on #ขบวน and routes the job', () => {
    expect(parseWake('#ขบวน')).toBe('help');
    expect(parseWake('#ขบวน สถานะ')).toBe('status');
    expect(parseWake('#ขบวน บรีฟ')).toBe('brief');
    expect(parseWake('#ขบวน เตือน')).toBe('remind');
    expect(parseWake('#ขบวน แชร์')).toBe('share');
    expect(parseWake('#convoy status')).toBe('status');
  });
});
