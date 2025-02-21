/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mmykkhhwhvnersxlusda.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig