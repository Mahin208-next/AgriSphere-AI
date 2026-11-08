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
};

export default nextConfig;
