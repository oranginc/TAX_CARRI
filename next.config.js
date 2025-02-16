/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['mmykkhhwhvnersxlusda.supabase.co'],
  },
}

module.exports = nextConfig 