/*
 * Чтение из Directus — те же функции и типы, что у моков (./mock.ts).
 * Правила выборки — content-model.md и .claude/skills/gal-directus/schema.md → «Чтение с сайта».
 *
 * Сайт ходит в Directus по внутреннему адресу (DIRECTUS_URL, на сервере 127.0.0.1:8055) без токена:
 * Public видит только опубликованное. Токен DIRECTUS_SITE_TOKEN (политика «Сайт — чтение») нужен
 * в одном месте — отличить скрытый раздел от несуществующего.
 *
 * Все запросы помечены тегом `directus`: Flow «Обновить сайт» дёргает /api/revalidate, и следующий
 * заход собирает страницу заново. Потерянный вебхук добирает revalidate раз в час.
 */
import 'server-only'
import type { BmwBody, DirectusFile, Faq, Location, PartPosition, PartSection, Service, SiteSettings, Social, Stat, Work, WorkPair } from './types'

const URL_BASE = (process.env.DIRECTUS_URL ?? '').replace(/\/$/, '')
export const CACHE_TAG = 'directus'

type Raw = Record<string, any>

async function get<T = Raw[]>(path: string, token?: string): Promise<T> {
  const res = await fetch(URL_BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { tags: [CACHE_TAG], revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`Directus ${res.status}: ${path}`)
  return (await res.json()).data as T
}

const FILE = 'id,width,height,focal_point_x,focal_point_y'
const fileFields = (field: string) => FILE.split(',').map((f) => `${field}.${f}`).join(',')
const published = 'filter[status][_eq]=published'

function toFile(raw: Raw | null | undefined): DirectusFile | null {
  if (!raw?.id || !raw.width || !raw.height) return null
  return {
    id: raw.id,
    src: `${URL_BASE}/assets/${raw.id}`,
    width: raw.width,
    height: raw.height,
    focal_point_x: raw.focal_point_x != null ? raw.focal_point_x / raw.width : null,
    focal_point_y: raw.focal_point_y != null ? raw.focal_point_y / raw.height : null,
  }
}

export async function getSettings(): Promise<SiteSettings> {
  const raw = await get<Raw>(`/items/site_settings?fields=*,${fileFields('ivan_photo')},${fileFields('service_image')},${fileFields('custom_banner')}`)
  const socials: Social[] = (raw.socials ?? []).map((s: Raw, i: number) => ({ id: `social-${i + 1}`, sort: i + 1, show_in_custom: false, ...s }))
  const locations: Location[] = (raw.locations ?? []).map((l: Raw, i: number) => ({
    id: `location-${i + 1}`,
    sort: i + 1,
    city_prepositional: null,
    purpose: null,
    hours: null,
    visit_allowed: null,
    yandex_maps_url: null,
    twogis_url: null,
    yandex_rating: null,
    ...l,
  }))
  const { id, group_contact, group_links, group_place, group_legal, group_media, ...rest } = raw
  return {
    ...(rest as SiteSettings),
    ivan_photo: toFile(raw.ivan_photo),
    service_image: toFile(raw.service_image),
    custom_banner: toFile(raw.custom_banner),
    socials,
    locations,
  }
}

/** Порядок серий и кузовов — как у моков: серия по SERIES_ORDER, внутри — sort */
export async function getBodiesRaw(): Promise<BmwBody[]> {
  const rows = await get(`/items/bmw_bodies?fields=code,series,years_from,years_to,status,sort&${published}&sort=sort,id&limit=-1`)
  return rows.map((b) => ({ id: b.code, code: b.code, series: b.series, years_from: b.years_from, years_to: b.years_to, status: b.status, sort: b.sort ?? 0 }))
}

const toSection = (s: Raw): PartSection => ({
  id: s.slug,
  slug: s.slug,
  name: s.name,
  description: s.description,
  description_short: s.description_short,
  cover: toFile(s.cover),
  icon: s.icon ?? 'generic',
  seo_title: s.seo_title,
  seo_description: s.seo_description,
  status: s.status,
  sort: s.sort ?? 0,
})

const SECTION_FIELDS = `id,slug,name,description,description_short,icon,seo_title,seo_description,status,sort,${fileFields('cover')}`

export async function getSectionsWithCounts() {
  const [sections, counts] = await Promise.all([
    get(`/items/part_sections?fields=${SECTION_FIELDS}&${published}&sort=sort,id&limit=-1`),
    get(`/items/part_positions?aggregate[count]=id&groupBy[]=section&${published}&filter[section][status][_eq]=published`),
  ])
  const byId = new Map(counts.map((c) => [String(c.section), Number(c.count?.id ?? c.count ?? 0)]))
  return sections.map((s) => ({ ...toSection(s), positionsCount: byId.get(String(s.id)) ?? 0 }))
}

export async function getSection(slug: string): Promise<PartSection | 'hidden' | null> {
  const safe = encodeURIComponent(slug)
  const rows = await get(`/items/part_sections?fields=${SECTION_FIELDS}&filter[slug][_eq]=${safe}&${published}&limit=1`)
  if (rows[0]) return toSection(rows[0])
  const token = process.env.DIRECTUS_SITE_TOKEN
  if (!token) return null
  const any = await get(`/items/part_sections?fields=slug,status&filter[slug][_eq]=${safe}&limit=1`, token)
  return any[0] ? 'hidden' : null
}

export async function getPositions(sectionSlug: string, bodyOrder: string[]): Promise<PartPosition[]> {
  const rows = await get(
    `/items/part_positions?fields=id,name,spec_note,price_from,status,sort,is_demo,${fileFields('photo')},bodies.bmw_bodies_id.code` +
      `&filter[section][slug][_eq]=${encodeURIComponent(sectionSlug)}&${published}&filter[section][status][_eq]=published&sort=sort,id&limit=-1`,
  )
  const rank = new Map(bodyOrder.map((code, i) => [code, i]))
  return rows.map((p) => ({
    id: String(p.id),
    section: sectionSlug,
    name: p.name,
    // скрытые кузова Public не отдаёт — вместо них null, выпадают
    bodies: (p.bodies ?? [])
      .map((j: Raw) => j?.bmw_bodies_id?.code)
      .filter((code: string | undefined): code is string => Boolean(code) && rank.has(code!))
      .sort((a: string, b: string) => rank.get(a)! - rank.get(b)!),
    spec_note: p.spec_note,
    price_from: p.price_from,
    photo: toFile(p.photo),
    status: p.status,
    sort: p.sort ?? 0,
    is_demo: Boolean(p.is_demo),
  }))
}

export async function getServices(): Promise<Service[]> {
  const rows = await get(`/items/services?fields=id,name,description,price_from,duration,status,sort,is_demo&${published}&sort=sort,id&limit=-1`)
  return rows.map((s) => ({ ...s, id: String(s.id), sort: s.sort ?? 0, is_demo: Boolean(s.is_demo) }) as Service)
}

export async function getWorksRaw(direction: Work['direction'], limit: number): Promise<Work[]> {
  const fields = [
    'id,direction,title,car,year,description,post_url,status,sort,is_demo',
    fileFields('cover'),
    'pairs.id,pairs.sort,pairs.caption,pairs.after_alignment',
    fileFields('pairs.before'),
    fileFields('pairs.after'),
    'photos.sort',
    fileFields('photos.directus_files_id'),
  ].join(',')
  const rows = await get(`/items/works?fields=${fields}&filter[direction][_eq]=${direction}&${published}&sort=sort,id&limit=${limit}`)
  return rows.map((w) => ({
    id: String(w.id),
    direction: w.direction,
    title: w.title,
    car: w.car,
    year: w.year,
    description: w.description,
    post_url: w.post_url,
    status: w.status,
    sort: w.sort ?? 0,
    is_demo: Boolean(w.is_demo),
    cover: toFile(w.cover),
    pairs: (w.pairs ?? [])
      .map((p: Raw): WorkPair | null => {
        const before = toFile(p.before)
        const after = toFile(p.after)
        if (!before || !after) return null
        return { id: String(p.id), work: String(w.id), before, after, caption: p.caption, sort: p.sort ?? 0, ...(p.after_alignment ? { after_alignment: p.after_alignment } : {}) }
      })
      .filter(Boolean) as WorkPair[],
    photos: [...(w.photos ?? [])]
      .sort((a: Raw, b: Raw) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((j: Raw) => toFile(j.directus_files_id))
      .filter(Boolean) as DirectusFile[],
  }))
}

export async function getFaq(): Promise<Faq[]> {
  const rows = await get(`/items/faq?fields=id,question,answer,status,sort,is_demo&${published}&sort=sort,id&limit=-1`)
  return rows.map((f) => ({ ...f, id: String(f.id), sort: f.sort ?? 0, is_demo: Boolean(f.is_demo) }) as Faq)
}

export async function getStats(): Promise<Stat[]> {
  const rows = await get(`/items/stats?fields=id,value,suffix,label,status,sort,is_demo&${published}&sort=sort,id&limit=5`)
  return rows.map((s) => ({ ...s, id: String(s.id), sort: s.sort ?? 0, is_demo: Boolean(s.is_demo) }) as Stat)
}
