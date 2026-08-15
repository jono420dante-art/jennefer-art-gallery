import { describe, expect, it } from 'vitest';
import {
  COLLECTOR_SIGNUP_DISMISS_KEY,
  dismissCollectorSignup,
  wasCollectorSignupDismissed,
} from './collectorSignup';

function createMemoryStore(initialValue: string | null = null) {
  let value = initialValue;
  return {
    getItem: (key: string) => key === COLLECTOR_SIGNUP_DISMISS_KEY ? value : null,
    setItem: (key: string, nextValue: string) => {
      if (key === COLLECTOR_SIGNUP_DISMISS_KEY) value = nextValue;
    },
  };
}

describe('collector signup dismissal', () => {
  it('does not treat a new session as dismissed', () => {
    expect(wasCollectorSignupDismissed(createMemoryStore())).toBe(false);
  });

  it('persists dismissal only in the supplied session store', () => {
    const store = createMemoryStore();
    dismissCollectorSignup(store);
    expect(wasCollectorSignupDismissed(store)).toBe(true);
  });
});
