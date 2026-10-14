/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export plain HTML/CSS/JS files for Cloudflare Pages; no Worker runtime.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
