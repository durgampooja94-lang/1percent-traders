/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vz-cdn.b-cdn.net', 'firebasestorage.googleapis.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
