import { SystemClock } from './system-clock';

describe('SystemClock', () => {
  it('should return the current date', () => {
    const clock = new SystemClock();

    const before = new Date();
    const now = clock.now();
    const after = new Date();

    expect(now.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(now.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
