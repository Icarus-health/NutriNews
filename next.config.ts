import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // Cache card detail pages for offline reading
    {
      urlPattern: /\/card\/[a-f0-9-]+$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'article-pages',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Cache the main feed page
    {
      urlPattern: /^\/$|\/\?/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'feed-pages',
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache Supabase API responses (news_cards)
    {
      urlPattern: /\.supabase\.co\/rest\/v1\/news_cards/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-articles',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    // Cache images/avatars
    {
      urlPattern: /\.supabase\.co\/storage/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default withPWA(nextConfig);
