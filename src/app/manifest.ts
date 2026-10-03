import type { MetadataRoute } from 'next'

// Иконка и имя при «Добавить на экран Домой» на Android; на iPhone — apple-icon.png рядом
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GAL — запчасти BMW',
    short_name: 'GAL',
    start_url: '/',
    display: 'browser',
    background_color: '#070707',
    theme_color: '#070707',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
