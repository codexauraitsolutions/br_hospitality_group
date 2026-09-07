// CSP note: script-src/style-src use 'unsafe-inline' rather than a per-request nonce.
// A nonce is stricter, but it requires reading headers() in the root layout, which forces
// every public page to render dynamically on every request — losing the static/ISR caching
// this site relies on for fast page loads and SEO. Every other directive below (img-src,
// connect-src, frame-src, object-src, form-action, frame-ancestors, base-uri) is still
// tightly scoped, which covers the vectors that matter most: cross-origin data exfiltration,
// rogue iframes/clickjacking, and injected forms/objects. React also auto-escapes all
// rendered content, so inline-script injection risk here is low.
//
// connect-src carries analytics.google.com because GA4 sends a second measurement hit there
// alongside google-analytics.com. The ad/remarketing endpoints gtag also reaches for
// (stats.g.doubleclick.net, google.<tld>/ads/ga-audiences) are deliberately left blocked —
// they feed Google Signals, not the page/event reports, so blocking them keeps the site's
// analytics intact while not handing visitor data to the ad network.
//
// `next dev` compiles modules with eval() for HMR and source maps, so without 'unsafe-eval'
// the dev bundle throws EvalError and React never hydrates — which leaves every framer-motion
// section stuck at its server-rendered initial state (opacity:0), i.e. a blank-looking site.
// Production bundles never eval, so the deployed policy stays strict.
const isDev = process.env.NODE_ENV !== 'production';

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.amazonaws.com;
  font-src 'self' data:;
  connect-src 'self' https://*.googleapis.com https://*.amazonaws.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.googletagmanager.com;
  frame-src https://www.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // don't leak "X-Powered-By: Next.js"
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
