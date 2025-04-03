// @ts-check
const path = require('path');

/**
 * Next.js設定ファイル
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // 画像最適化設定
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    domains: process.env.NODE_ENV === 'development' ? ['localhost'] : []
  },

  // 環境変数
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  },

  // 本番環境専用設定
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 300
  })
};

// スタンドアロンモード用設定
const standaloneConfig = {
  output: 'standalone',
};

module.exports = nextConfig;