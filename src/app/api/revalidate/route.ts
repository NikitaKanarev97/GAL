/*
 * Вебхук Flow «Обновить сайт» в Directus: правка в админке → следующий заход собирает страницы заново.
 * Сбрасываем весь тег `directus`, а не коллекцию: связи (разделы ↔ позиции, работы ↔ пары, файлы)
 * задевают соседние блоки, а страниц всего десяток — точечность не окупается.
 * { expire: 0 } — без показа старой версии: редактор обновил страницу и сразу видит правку.
 */
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { CACHE_TAG } from '@/data/directus'

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return Response.json({ revalidated: false }, { status: 401 })
  }
  const body = await request.json().catch(() => ({}))
  revalidateTag(CACHE_TAG, { expire: 0 })
  return Response.json({ revalidated: true, collection: body?.collection ?? null })
}
