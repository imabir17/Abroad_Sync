import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AbroadSync',
    short_name: 'AbroadSync',
    description: 'Workspace for Study Abroad Consultancy Agency',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#E7ECF3',
    theme_color: '#4855E4',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
