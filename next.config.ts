import type { NextConfig } from 'next'

const directusAssets = (() => {
  if (!process.env.DIRECTUS_URL) return null
  const url = new URL(process.env.DIRECTUS_URL)
  return {
    local: ['127.0.0.1', 'localhost'].includes(url.hostname),
    pattern: {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port,
      pathname: '/assets/**',
    },
  }
})()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // next dev иначе дописывает свой блок в CLAUDE.md проекта
  agentRules: false,
  // значок Next.js в углу не должен попадать в записи экрана для клиента
  devIndicators: false,
  // next dev отдаёт скрипты только localhost; без этого телефон по Wi‑Fi получает страницу без JS (нет прелоадера и анимаций)
  allowedDevOrigins: ['192.168.0.140'],
  images: {
    // next/image сам отдаёт AVIF/WebP по заголовку Accept, jpg-исходник — фолбэк
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 992, 1280, 1600, 1920, 2560, 3840],
    // Фото из админки: next/image берёт оригинал у Directus по внутреннему адресу сервера и сжимает сам.
    // Next 16 по умолчанию не ходит на локальные IP (SSRF) — разрешаем, но только /assets/ этого Directus.
    ...(directusAssets
      ? {
          dangerouslyAllowLocalIP: directusAssets.local,
          remotePatterns: [directusAssets.pattern],
        }
      : {}),
  },
}

export default nextConfig
