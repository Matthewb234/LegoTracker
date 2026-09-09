import { useEffect, useState } from 'react';
import {
  getInstallState,
  subscribeToInstallState,
  isStandalone,
  type InstallState,
} from './installPrompt';

/**
 * A read-only diagnostic screen. Route it at /debug, outside any auth guard.
 *
 * The point is that a family member three states away can open this, hit
 * "Copy report", and paste you everything you would otherwise have needed
 * USB debugging to find out.
 */

type SwInfo = {
  supported: boolean;
  registered: boolean;
  scope: string | null;
  active: string | null;
  waiting: boolean;
  installing: boolean;
  controlling: boolean;
  scriptUrl: string | null;
  error: string | null;
};

type ManifestInfo = {
  linkFound: boolean;
  href: string | null;
  fetchOk: boolean | null;
  name: string | null;
  display: string | null;
  iconCount: number | null;
  error: string | null;
};

/** Fetches /manifest.webmanifest directly, ignoring whether a link tag exists. */
type DirectManifestInfo = {
  status: string;
  parsed: boolean;
  error: string | null;
};

/** Fetches / from the network to compare server HTML against the live DOM. */
type HtmlProbeInfo = {
  status: string;
  networkHasManifestLink: boolean | null;
  domHasManifestLink: boolean;
  domLinkRels: string;
  error: string | null;
};

// Injected by Vite's `define` — see wiring notes.
declare const __BUILD_TIME__: string;

/** Plain-language browser name, so you don't have to parse a UA string. */
function browserName(ua: string): string {
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
  if (/EdgA?\//i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  if (/Firefox|FxiOS/i.test(ua)) return 'Firefox';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook in-app browser';
  if (/Instagram/i.test(ua)) return 'Instagram in-app browser';
  if (/Line\//i.test(ua)) return 'LINE in-app browser';
  if (/CriOS/i.test(ua)) return 'Chrome (iOS)';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'unknown';
}

export function DebugPanel() {
  const [install, setInstall] = useState<InstallState>(getInstallState());
  const [sw, setSw] = useState<SwInfo | null>(null);
  const [manifest, setManifest] = useState<ManifestInfo | null>(null);
  const [direct, setDirect] = useState<DirectManifestInfo | null>(null);
  const [html, setHtml] = useState<HtmlProbeInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => subscribeToInstallState(setInstall), []);

  useEffect(() => {
    let cancelled = false;

    async function readServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        if (!cancelled) {
          setSw({
            supported: false,
            registered: false,
            scope: null,
            active: null,
            waiting: false,
            installing: false,
            controlling: false,
            scriptUrl: null,
            error: null,
          });
        }
        return;
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (cancelled) return;

        setSw({
          supported: true,
          registered: Boolean(reg),
          scope: reg?.scope ?? null,
          active: reg?.active?.state ?? null,
          waiting: Boolean(reg?.waiting),
          installing: Boolean(reg?.installing),
          controlling: Boolean(navigator.serviceWorker.controller),
          scriptUrl: reg?.active?.scriptURL ?? null,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setSw({
          supported: true,
          registered: false,
          scope: null,
          active: null,
          waiting: false,
          installing: false,
          controlling: false,
          scriptUrl: null,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    async function readManifestLink() {
      const link = document.querySelector<HTMLLinkElement>(
          'link[rel="manifest"]'
      );

      if (!link) {
        if (!cancelled) {
          setManifest({
            linkFound: false,
            href: null,
            fetchOk: null,
            name: null,
            display: null,
            iconCount: null,
            error: null,
          });
        }
        return;
      }

      try {
        const res = await fetch(link.href);
        const json = res.ok ? await res.json() : null;
        if (cancelled) return;

        setManifest({
          linkFound: true,
          href: link.href,
          fetchOk: res.ok,
          name: json?.name ?? json?.short_name ?? null,
          display: json?.display ?? null,
          iconCount: Array.isArray(json?.icons) ? json.icons.length : null,
          error: res.ok ? null : `HTTP ${res.status}`,
        });
      } catch (err) {
        if (cancelled) return;
        setManifest({
          linkFound: true,
          href: link.href,
          fetchOk: false,
          name: null,
          display: null,
          iconCount: null,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Does the file exist and parse, regardless of whether a link tag points
    // at it? Separates "the tag is missing" from "the file isn't served".
    async function probeManifestDirectly() {
      try {
        const res = await fetch('/manifest.webmanifest', { cache: 'no-store' });
        let parsed = false;
        if (res.ok) {
          try {
            await res.clone().json();
            parsed = true;
          } catch {
            parsed = false;
          }
        }
        if (cancelled) return;
        setDirect({
          status: `HTTP ${res.status}`,
          parsed,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setDirect({
          status: 'fetch failed',
          parsed: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // What did the server actually send, versus what ended up in the DOM?
    // A gap between these means something on the device is rewriting the page.
    async function probeHtml() {
      const domLink = document.querySelector('link[rel="manifest"]');
      const rels = Array.from(document.querySelectorAll('link'))
          .map((l) => l.getAttribute('rel') ?? '?')
          .join(', ');

      try {
        const res = await fetch('/', { cache: 'no-store' });
        const text = res.ok ? await res.text() : '';
        if (cancelled) return;

        setHtml({
          status: `HTTP ${res.status}`,
          networkHasManifestLink: res.ok
              ? /rel=["']?manifest/i.test(text)
              : null,
          domHasManifestLink: Boolean(domLink),
          domLinkRels: rels || 'none',
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setHtml({
          status: 'fetch failed',
          networkHasManifestLink: null,
          domHasManifestLink: Boolean(domLink),
          domLinkRels: rels || 'none',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    void readServiceWorker();
    void readManifestLink();
    void probeManifestDirectly();
    void probeHtml();

    // Service worker state changes shortly after first load, so re-read.
    const timer = setInterval(readServiceWorker, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const buildTime =
      typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : 'not configured';

  // Which bundle is this device actually running? A second, independent check
  // on the build timestamp.
  const bundleScript =
      Array.from(document.scripts)
          .map((s) => s.src)
          .filter((src) => src.includes('/assets/'))
          .map((src) => src.split('/').pop())
          .join(', ') || 'none found';

  const ua = navigator.userAgent;

  // Seconds since this page was mounted. If a report shows a large number,
  // it was copied from a tab that has been sitting open and the values are
  // stale — ask for a fresh load instead of trusting it.
  const [ageSeconds, setAgeSeconds] = useState(0);
  useEffect(() => {
    const mounted = Date.now();
    const t = setInterval(
        () => setAgeSeconds(Math.round((Date.now() - mounted) / 1000)),
        1000
    );
    return () => clearInterval(t);
  }, []);

  const rows: Array<[string, string, 'good' | 'bad' | 'neutral']> = [
    ['Report generated', new Date().toISOString(), 'neutral'],
    [
      'Page age (seconds)',
      String(ageSeconds),
      ageSeconds > 120 ? 'bad' : 'good',
    ],
    ['Build', buildTime, 'neutral'],
    ['Bundle', bundleScript, 'neutral'],
    ['Browser', browserName(ua), 'neutral'],
    ['URL', window.location.origin, 'neutral'],
    ['Secure context', String(window.isSecureContext), window.isSecureContext ? 'good' : 'bad'],
    ['Online', String(navigator.onLine), navigator.onLine ? 'good' : 'bad'],
    ['Standalone', String(isStandalone()), 'neutral'],
    [
      'Install available',
      install.installed ? 'already installed' : String(install.canInstall),
      install.canInstall || install.installed ? 'good' : 'bad',
    ],
    ['SW supported', String(sw?.supported ?? '…'), sw?.supported ? 'good' : 'bad'],
    ['SW registered', String(sw?.registered ?? '…'), sw?.registered ? 'good' : 'bad'],
    ['SW active state', sw?.active ?? 'none', sw?.active === 'activated' ? 'good' : 'bad'],
    ['SW controlling page', String(sw?.controlling ?? '…'), sw?.controlling ? 'good' : 'bad'],
    ['SW waiting (stuck update)', String(sw?.waiting ?? '…'), sw?.waiting ? 'bad' : 'good'],
    ['SW script', sw?.scriptUrl ?? 'none', 'neutral'],

    ['Manifest link in DOM', String(manifest?.linkFound ?? '…'), manifest?.linkFound ? 'good' : 'bad'],
    ['Manifest link in server HTML', String(html?.networkHasManifestLink ?? '…'), html?.networkHasManifestLink ? 'good' : 'bad'],
    ['HTML fetch', html?.status ?? '…', html?.status?.includes('200') ? 'good' : 'bad'],
    ['All link rels in DOM', html?.domLinkRels ?? '…', 'neutral'],
    ['Manifest file direct', direct?.status ?? '…', direct?.status?.includes('200') ? 'good' : 'bad'],
    ['Manifest file parses', String(direct?.parsed ?? '…'), direct?.parsed ? 'good' : 'bad'],
    ['Manifest loads via link', String(manifest?.fetchOk ?? '…'), manifest?.fetchOk ? 'good' : 'bad'],
    ['Manifest display', manifest?.display ?? 'none', manifest?.display === 'standalone' ? 'good' : 'bad'],
    ['Manifest icons', String(manifest?.iconCount ?? '…'), (manifest?.iconCount ?? 0) > 0 ? 'good' : 'bad'],

    ['Camera API', String('mediaDevices' in navigator), 'mediaDevices' in navigator ? 'good' : 'bad'],
    ['User agent', ua, 'neutral'],
  ];

  const report = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the text is on screen either way.
      setCopied(false);
    }
  }

  return (
      <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            lineHeight: 1.5,
            padding: 16,
            maxWidth: 640,
            margin: '0 auto',
            color: '#e6e6e6',
            background: '#141414',
            minHeight: '100vh',
          }}
      >
        <h1 style={{ fontSize: 16, margin: '0 0 4px', fontWeight: 600 }}>
          Diagnostics
        </h1>
        <p style={{ margin: '0 0 16px', color: '#8a8a8a' }}>
          Tap Copy report and paste it back, or send a screenshot of this screen.
        </p>

        <button
            onClick={copyReport}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              marginBottom: 20,
              fontFamily: 'inherit',
              fontSize: 14,
              color: '#141414',
              background: '#7dd88f',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
        >
          {copied ? 'Copied' : 'Copy report'}
        </button>

        <dl style={{ margin: 0 }}>
          {rows.map(([label, value, status]) => (
              <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '6px 0',
                    borderTop: '1px solid #2a2a2a',
                    alignItems: 'baseline',
                  }}
              >
                <dt style={{ flex: '0 0 42%', color: '#8a8a8a' }}>{label}</dt>
                <dd
                    style={{
                      flex: 1,
                      margin: 0,
                      wordBreak: 'break-all',
                      color:
                          status === 'good'
                              ? '#7dd88f'
                              : status === 'bad'
                                  ? '#f0857d'
                                  : '#e6e6e6',
                    }}
                >
                  {value}
                </dd>
              </div>
          ))}
        </dl>
      </div>
  );
}