/**
 * Captures Chrome's `beforeinstallprompt` event.
 *
 * This module registers its listener at import time, NOT inside a React
 * component. The event can fire before React mounts, and it only fires once —
 * if nothing is listening at that moment, it is gone for the life of the page.
 *
 * Import this from main.tsx (before rendering) so the listener is attached as
 * early as possible.
 */

// Chrome-only event, not in the standard DOM lib.
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type InstallState = {
  /** True once Chrome has told us the app meets install criteria. */
  canInstall: boolean;
  /** True once the app has been installed in this session. */
  installed: boolean;
  /** Set if prompt() threw, for the debug panel. */
  lastError: string | null;
};

let deferredEvent: BeforeInstallPromptEvent | null = null;

let state: InstallState = {
  canInstall: false,
  installed: false,
  lastError: null,
};

const subscribers = new Set<(s: InstallState) => void>();

function setState(patch: Partial<InstallState>) {
  state = { ...state, ...patch };
  subscribers.forEach((fn) => fn(state));
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Stop Chrome showing its own mini-infobar so we control the moment.
  e.preventDefault();
  deferredEvent = e as BeforeInstallPromptEvent;
  setState({ canInstall: true });
});

window.addEventListener('appinstalled', () => {
  deferredEvent = null;
  setState({ canInstall: false, installed: true });
});

export function getInstallState(): InstallState {
  return state;
}

export function subscribeToInstallState(fn: (s: InstallState) => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/**
 * Shows the native install dialog. Must be called from a user gesture
 * (a click handler) or Chrome will reject it.
 */
export async function promptInstall(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  if (!deferredEvent) return 'unavailable';

  try {
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;

    // The event is single-use. Chrome will fire a fresh one if the user
    // dismisses and the app still qualifies.
    deferredEvent = null;
    setState({ canInstall: false });

    return outcome;
  } catch (err) {
    setState({ lastError: err instanceof Error ? err.message : String(err) });
    return 'unavailable';
  }
}

/** True when running from the installed icon rather than a browser tab. */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}
