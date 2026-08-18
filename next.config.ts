import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  serverExternalPackages: ['sharp'],
  images: { formats: ['image/avif', 'image/webp'], minimumCacheTTL: 14400 },
  async headers() {
    return [{source:'/:path*',headers:[
      { key: 'Content-Security-Policy', value: csp },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ]}];
  },
};
export default nextConfig;
