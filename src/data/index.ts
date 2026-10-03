/*
 * Слой чтения данных. Есть DIRECTUS_URL — читаем Directus (./directus.ts), нет — моки
 * (seed demo / edge через GAL_SEED=edge): так вёрстка живёт без админки.
 * Правила выборки — content-model.md: только published, порядок по sort, лимиты блоков.
 */
import 'server-only'
import type { BmwBody, DirectusFile, PartPosition, PartSection, Seed, Series, Work } from './types'
import * as cms from './directus'
import { demo } from './seed/demo'
import { edge } from './seed/edge'

const useDirectus = Boolean(process.env.DIRECTUS_URL)
const seed: Seed = process.env.GAL_SEED === 'edge' ? edge : demo

const isPublished = <T extends { status: string }>(x: T) => x.status === 'published'
const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort

export const SERIES_ORDER: Series[] = ['1', '2', '3', '4', '5', '6', '7', '8', 'X', 'Z', 'M']

export async function getSettings() {
  if (useDirectus) return cms.getSettings()
  return seed.site_settings
}

export async function getBodies(): Promise<BmwBody[]> {
  const bodies = useDirectus ? await cms.getBodiesRaw() : seed.bmw_bodies.filter(isPublished)
  return bodies.sort((a, b) => SERIES_ORDER.indexOf(a.series) - SERIES_ORDER.indexOf(b.series) || a.sort - b.sort)
}

export type SectionWithCount = PartSection & { positionsCount: number }

export async function getSections(): Promise<SectionWithCount[]> {
  if (useDirectus) return cms.getSectionsWithCounts()
  const positions = seed.part_positions.filter(isPublished)
  return seed.part_sections
    .filter(isPublished)
    .sort(bySort)
    .map((s) => ({ ...s, positionsCount: positions.filter((p) => p.section === s.id).length }))
}

/** null — раздела нет (404); hidden — есть, но скрыт (редирект на /#parts) */
export async function getSection(slug: string): Promise<PartSection | 'hidden' | null> {
  if (useDirectus) return cms.getSection(slug)
  const section = seed.part_sections.find((s) => s.slug === slug)
  if (!section) return null
  return isPublished(section) ? section : 'hidden'
}

/** Позиции раздела; скрытые кузова выпадают из bodies (content-model.md §2) */
export async function getPositions(sectionId: string): Promise<PartPosition[]> {
  const bodies = await getBodies()
  if (useDirectus) return cms.getPositions(sectionId, bodies.map((b) => b.code))
  const bodyIds = new Set(bodies.map((b) => b.id))
  return seed.part_positions
    .filter((p) => isPublished(p) && p.section === sectionId)
    .sort(bySort)
    .map((p) => ({ ...p, bodies: p.bodies.filter((id) => bodyIds.has(id)) }))
}

export async function getServices() {
  if (useDirectus) return cms.getServices()
  return seed.services.filter(isPublished).sort(bySort)
}

export type WorkView = Work & { coverResolved: DirectusFile | null }

const WORK_LIMIT = { service: 3, custom: 12 } as const

/** Обложка, если cover пуст: «после» из первой пары → первое фото галереи */
export async function getWorks(direction: Work['direction']): Promise<WorkView[]> {
  const works = useDirectus
    ? await cms.getWorksRaw(direction, WORK_LIMIT[direction])
    : seed.works
        .filter((w) => isPublished(w) && w.direction === direction)
        .sort(bySort)
        .slice(0, WORK_LIMIT[direction])
  return works
    .map((w) => {
      const pairs = [...w.pairs].sort(bySort)
      return { ...w, pairs, coverResolved: w.cover ?? pairs[0]?.after ?? w.photos[0] ?? null }
    })
    .filter((w) => w.coverResolved)
}

export async function getFaq() {
  if (useDirectus) return cms.getFaq()
  return seed.faq.filter(isPublished).sort(bySort)
}

export async function getStats() {
  if (useDirectus) return cms.getStats()
  return seed.stats.filter(isPublished).sort(bySort).slice(0, 5)
}
