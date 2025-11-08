import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oppimis App',
    short_name: 'Oppimis',
    description:
      'Hauska oppimissovellus, jossa opit sanastoa emojeilla ja pelillisillä tiloilla.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E0F2FE',
    theme_color: '#1D4ED8',
    lang: 'fi-FI',
    icons: [
      {
        src: '/globe.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/globe.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    screenshots: [
      {
        src: '/window.svg',
        type: 'image/svg+xml',
        sizes: '512x512',
        form_factor: 'wide',
      },
    ],
  };
}

