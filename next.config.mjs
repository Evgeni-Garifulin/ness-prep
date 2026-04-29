/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow large server actions if we ever stream long answers.
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
