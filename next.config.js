/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  assetPrefix: "/landing-assets",
  async rewrites() {
    return [
      {
        source: "/landing-assets/_next/:path*",
        destination: "/_next/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
