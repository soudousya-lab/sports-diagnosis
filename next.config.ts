import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  // 旧B2Bルート（/pricing, /contact）は /business 配下へ301。
  // / は B2Cハブに刷新済（旧B2B LPは /business に複製済）。
  async redirects() {
    return [
      {
        source: '/pricing',
        destination: '/business/pricing',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/business/contact',
        permanent: true,
      },
    ]
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
