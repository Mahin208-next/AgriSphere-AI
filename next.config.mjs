/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com', 'via.placeholder.com'],
  },
  experimental: {
    webpackBuildWorker: false,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
