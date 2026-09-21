/*
 * Слой чтения данных. Сейчас — моки (seed demo / edge), на этапе 5 тела функций
 * заменяются запросами к Directus, сигнатуры остаются.
 * Правила выборки — content-model.md: только published, порядок по sort, лимиты блоков.
 */
import 'server-only'
import type { BmwBody, DirectusFile, PartPosition, PartSection, Seed, Series, Work } from './types'
import { demo } from './seed/demo'
import { edge } from './seed/edge'

const seed: Seed = process.env.GAL_SEED === 'edge' ? edge : demo

const isPublished = <T extends { status: string }>(x: T) => x.status === 'published'
const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort

export const SERIES_ORDER: Series[] = ['1', '2', '3', '4', '5', '6', '7', '8', 'X', 'Z', 'M']

export async function getSettings() {
  return seed.site_settings
}

export async function getBodies(): Promise<BmwBody[]> {
  return seed.bmw_bodies
    .filter(isPublished)
    .sort((a, b) => SERIES_ORDER.indexOf(a.series) - SERIES_ORDER.indexOf(b.series) || a.sort - b.sort)
}

export type SectionWithCount = PartSection & { positionsCount: number }

export async function getSections(): Promise<SectionWithCount[]> {
  const positions = seed.part_positions.filter(isPublished)
  return seed.part_sections
    .filter(isPublished)
    .sort(bySort)
    .map((s) => ({ ...s, positionsCount: positions.filter((p) => p.section === s.id).length }))
}

/** null — раздела нет (404); hidden — есть, но скрыт (редирект на /#parts) */
export async function getSection(slug: string): Promise<PartSection | 'hidden' | null> {
  const section = seed.part_sections.find((s) => s.slug === slug)
  if (!section) return null
  return isPublished(section) ? section : 'hidden'
}

/** Позиции раздела; скрытые кузова выпадают из bodies (content-model.md §2) */
export async function getPositions(sectionId: string): Promise<PartPosition[]> {
  const bodyIds = new Set((await getBodies()).map((b) => b.id))
  return seed.part_positions
    .filter((p) => isPublished(p) && p.section === sectionId)
    .sort(bySort)
    .map((p) => ({ ...p, bodies: p.bodies.filter((id) => bodyIds.has(id)) }))
}

export async function getServices() {
  return seed.services.filter(isPublished).sort(bySort)
}

export type WorkView = Work & { coverResolved: DirectusFile | null }

const WORK_LIMIT = { service: 3, custom: 12 } as const

/** Обложка, если cover пуст: «после» из первой пары → первое фото галереи */
export async function getWorks(direction: Work['direction']): Promise<WorkView[]> {
  return seed.works
    .filter((w) => isPublished(w) && w.direction === direction)
    .sort(bySort)
    .slice(0, WORK_LIMIT[direction])
    .map((w) => {
      const pairs = [...w.pairs].sort(bySort)
      return { ...w, pairs, coverResolved: w.cover ?? pairs[0]?.after ?? w.photos[0] ?? null }
    })
    .filter((w) => w.coverResolved)
}

export async function getFaq() {
  return seed.faq.filter(isPublished).sort(bySort)
}

export async function getStats() {
  return seed.stats.filter(isPublished).sort(bySort).slice(0, 4)
}
