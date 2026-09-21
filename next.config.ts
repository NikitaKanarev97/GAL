import type { NextConfig } from 'next'

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
  },
}

export default nextConfig
