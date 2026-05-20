import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MPP Voting System',
    short_name: 'MPP Vote',
    description: 'Official MPP Student Representative Council Election Voting Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfdfd',
    theme_color: '#4c0519',
    orientation: 'portrait-primary',
    categories: ['education', 'politics', 'voting'],
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192-maskable.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon-512-maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
