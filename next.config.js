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
      {
        source: '/reset-password',
        destination: '/auth/reset-password',
        permanent: true,
      },
      {
        source: '/update-password',
        destination: '/auth/update-password',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'code' }],
        destination: '/auth/update-password',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig