import { useEffect, useState } from 'react';
import {
  getInstallState,
  subscribeToInstallState,
  promptInstall,
  isStandalone,
  type InstallState,
} from './installPrompt';

/**
 * Shows an Install button when Chrome says the app qualifies, and honest
 * instructions when it doesn't.
 *
 * Renders nothing when already running installed, so it stays out of the way
 * for people who've done it.
 */
export default function InstallButton() {
  const [state, setState] = useState<InstallState>(getInstallState());
  const [standalone] = useState(isStandalone);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => subscribeToInstallState(setState), []);

  if (standalone || state.installed || dismissed) return null;

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome === 'accepted') setDismissed(true);
  }

  const inAppBrowser = /FBAN|FBAV|Instagram|Line|WhatsApp|Snapchat/i.test(
    navigator.userAgent
  );

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: '#f2f4f7',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {state.canInstall ? (
        <>
          <span style={{ flex: 1, minWidth: 180 }}>
            Add this to your home screen to open it like a normal app.
          </span>
          <button
            onClick={handleInstall}
            style={{
              padding: '10px 18px',
              fontSize: 15,
              border: 'none',
              borderRadius: 6,
              background: '#1f2937',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Install
          </button>
        </>
      ) : (
        <span style={{ flex: 1 }}>
          {inAppBrowser
            ? 'To install this app, open it in Chrome instead of here. Tap the menu and choose "Open in browser".'
            : 'To install, open this page in Chrome, use it for a moment, then tap the browser menu and choose "Install app".'}
        </span>
      )}

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          padding: '6px 10px',
          fontSize: 14,
          border: 'none',
          background: 'transparent',
          color: '#6b7280',
          cursor: 'pointer',
        }}
      >
        Not now
      </button>
    </div>
  );
}
