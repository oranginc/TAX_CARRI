/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mmykkhhwhvnersxlusda.supabase.co'],
  },
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/auth/signin',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig