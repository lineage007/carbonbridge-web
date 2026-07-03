import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referrer policy — leak no path information to third parties
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy — disable unused browser APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // CSP — report-only mode first (inline scripts exist in this Next.js app).
  // Upgrade to enforcing once nonce-based or hash-based CSP is implemented.
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.ipify.org https://vitals.vercel-insights.com",
      "frame-ancestors 'self'",
    ].join('; '),
  },
  // Strict-Transport-Security — tell browsers to always use HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
