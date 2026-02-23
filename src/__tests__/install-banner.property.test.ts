import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isIOSDevice, shouldShowBanner } from '../components/pwa/InstallBanner';

/**
 * **Feature: v10, Property 1: Install Banner Visibility Logic**
 * *For any* combination of (isStandalone, isDismissed, visitCount) states, the InstallBanner
 * should be visible if and only if `!isStandalone && !isDismissed && visitCount >= 2`.
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */
describe('Property 1: Install Banner Visibility Logic', () => {
  it('banner is visible only when not standalone AND not dismissed AND visitCount >= 2', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isStandalone
        fc.boolean(), // isDismissed
        fc.integer({ min: 0, max: 100 }), // visitCount
        (isStandalone, isDismissed, visitCount) => {
          const result = shouldShowBanner(isStandalone, isDismissed, visitCount);
          const expected = !isStandalone && !isDismissed && visitCount >= 2;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('banner is hidden when in standalone mode regardless of dismissal or visit count', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isDismissed
        fc.integer({ min: 0, max: 100 }), // visitCount
        (isDismissed, visitCount) => {
          const result = shouldShowBanner(true, isDismissed, visitCount);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('banner is hidden when dismissed regardless of standalone mode or visit count', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isStandalone
        fc.integer({ min: 0, max: 100 }), // visitCount
        (isStandalone, visitCount) => {
          const result = shouldShowBanner(isStandalone, true, visitCount);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('banner is hidden on first visit (visitCount < 2) even when not standalone and not dismissed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1 }), // visitCount below threshold
        (visitCount) => {
          const result = shouldShowBanner(false, false, visitCount);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('banner is shown from 2nd visit onwards when not standalone and not dismissed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }), // visitCount at or above threshold
        (visitCount) => {
          const result = shouldShowBanner(false, false, visitCount);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: v10, Property 2: Install Banner Dismissal Persistence**
 * *For any* dismissal action on the InstallBanner, the localStorage key should be 
 * set to "true" and subsequent visibility checks should return false.
 * **Validates: Requirements 2.3**
 */
describe('Property 2: Install Banner Dismissal Persistence', () => {
  it('after dismissal, visibility should always be false regardless of visit count', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isStandalone
        fc.integer({ min: 0, max: 100 }), // visitCount
        (isStandalone, visitCount) => {
          // After dismissal, isDismissed is always true
          const isDismissed = true;
          const result = shouldShowBanner(isStandalone, isDismissed, visitCount);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: v10, Property 3: iOS Platform Detection**
 * *For any* user agent string containing "iPad", "iPhone", or "iPod", 
 * the InstallBanner should display iOS-specific instructions.
 * **Validates: Requirements 2.4**
 */
describe('Property 3: iOS Platform Detection', () => {
  const iosDevices = ['iPad', 'iPhone', 'iPod'];
  const nonIosAgents = [
    'Mozilla/5.0 (Linux; Android 10)',
    'Mozilla/5.0 (Windows NT 10.0)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
    'Mozilla/5.0 (X11; Linux x86_64)',
  ];

  it('detects iOS devices correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...iosDevices),
        fc.string(), // prefix
        fc.string(), // suffix
        (device, prefix, suffix) => {
          const userAgent = `${prefix}${device}${suffix}`;
          expect(isIOSDevice(userAgent)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false for non-iOS user agents', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...nonIosAgents),
        (userAgent) => {
          expect(isIOSDevice(userAgent)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false for user agents without iOS device strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !iosDevices.some(d => s.includes(d))),
        (userAgent) => {
          expect(isIOSDevice(userAgent)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
