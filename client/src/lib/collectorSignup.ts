export const COLLECTOR_SIGNUP_DISMISS_KEY = 'jennefer_collector_popup_dismissed';

type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;

function getSessionStore(): SessionStore | null {
  return typeof window === 'undefined' ? null : window.sessionStorage;
}

export function wasCollectorSignupDismissed(store: SessionStore | null = getSessionStore()) {
  return store?.getItem(COLLECTOR_SIGNUP_DISMISS_KEY) === 'true';
}

export function dismissCollectorSignup(store: SessionStore | null = getSessionStore()) {
  store?.setItem(COLLECTOR_SIGNUP_DISMISS_KEY, 'true');
}
