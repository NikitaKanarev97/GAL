/*
 * GAL — хуки Directus (.claude/skills/gal-directus/schema.md → «Хуки»).
 * Без сборки: исходник и есть dist, чтобы править на сервере без npm run build.
 *
 * 1. Чистка текста: обрезка пробелов, схлопывание двойных, пустая строка → null.
 * 2. Проверки, которых нет в валидации полей: минимум фото по месту, работа без фото,
 *    годы кузова, телефон/WhatsApp и списки соцсетей и мест в настройках.
 * 3. Фото больше 3200 px по длинной стороне уменьшаются сразу после загрузки —
 *    на сервере 1 ГБ памяти и 10 ГБ диска, а сайт всё равно не показывает больше.
 */
import { InvalidPayloadError } from '@directus/errors'
import { rename, stat } from 'node:fs/promises'
import path from 'node:path'

const COLLECTIONS = [
  'part_sections',
  'part_positions',
  'bmw_bodies',
  'services',
  'works',
  'work_pairs',
  'faq',
  'stats',
  'site_settings',
]

/** Ручной порядок. Пары «до/после» не здесь: порядок внутри работы ставит сама админка */
const SORTED = ['part_sections', 'part_positions', 'bmw_bodies', 'services', 'works', 'faq', 'stats']

/** Поля text: абзацы сохраняются, в остальных строках переносы схлопываются в пробел */
const TEXT_FIELDS = {
  part_sections: ['description'],
  works: ['description'],
  faq: ['answer'],
  site_settings: ['intro'],
}

/** Минимум короткой стороны фото по месту — content-model.md → «Фото» */
const MIN_SIDE = {
  part_sections: { cover: 800 },
  part_positions: { photo: 600 },
  works: { cover: 900 },
  work_pairs: { before: 900, after: 900 },
  site_settings: { ivan_photo: 720, service_image: 1000, custom_banner: 900 },
}

const MAX_SIDE = 3200
const IMAGE_TYPES = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' }

const fail = (reason) => {
  throw new InvalidPayloadError({ reason })
}

function cleanString(value, multiline) {
  let v = value.replace(/ /g, ' ')
  v = multiline
    ? v.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n')
    : v.replace(/\s+/g, ' ')
  v = v.trim()
  return v === '' ? null : v
}

function cleanPayload(collection, payload) {
  const text = TEXT_FIELDS[collection] ?? []
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') payload[key] = cleanString(value, text.includes(key))
    else if (Array.isArray(value) && (key === 'socials' || key === 'locations')) {
      payload[key] = value.map((row) => {
        if (!row || typeof row !== 'object') return row
        const out = { ...row }
        for (const [k, v] of Object.entries(out)) if (typeof v === 'string') out[k] = cleanString(v, false)
        // «@» сайт ставит сам: введённый с ним ник выходил «@@gal_custom»
        if (typeof out.handle === 'string') out.handle = out.handle.replace(/^@+/, '') || null
        return out
      })
    }
  }
  return payload
}

const fileId = (value) => (value && typeof value === 'object' ? value.id : value)

/** Число связанных записей после сохранения: payload O2M/M2M — массив или {create, update, delete} */
function countAfter(value, dbCount) {
  if (value === undefined) return dbCount
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') {
    return dbCount + (value.create?.length ?? 0) - (value.delete?.length ?? 0)
  }
  return dbCount
}

const isHttps = (v) => typeof v === 'string' && /^https:\/\/\S+$/.test(v)

export default ({ filter, action }, { env, logger }) => {
  async function checkPhotos(collection, payload, database) {
    const fields = MIN_SIDE[collection]
    if (!fields) return
    for (const [field, min] of Object.entries(fields)) {
      const id = fileId(payload[field])
      if (!id) continue
      const file = await database('directus_files').select('width', 'height').where({ id }).first()
      if (!file?.width || !file?.height) continue
      if (Math.min(file.width, file.height) < min) {
        fail(`Фото маленькое — на сайте будет мыльным. Нужно от ${min} px по короткой стороне, а у этого ${Math.min(file.width, file.height)} px`)
      }
    }
  }

  async function current(collection, key, database) {
    if (collection === 'site_settings') return (await database('site_settings').first()) ?? null
    if (key === undefined || key === null) return null
    return (await database(collection).where({ id: key }).first()) ?? null
  }

  async function checkItem(collection, payload, key, database) {
    await checkPhotos(collection, payload, database)
    const before = await current(collection, key, database)
    const merged = { ...(before ?? {}), ...payload }

    if (collection === 'works') {
      const status = merged.status ?? 'published'
      if (status === 'published') {
        const dbPairs = key ? Number((await database('work_pairs').where({ work: key }).count('* as n').first())?.n ?? 0) : 0
        const dbPhotos = key ? Number((await database('works_files').where({ works_id: key }).count('* as n').first())?.n ?? 0) : 0
        const hasCover = Boolean(fileId(merged.cover))
        const pairs = countAfter(payload.pairs, dbPairs)
        const photos = countAfter(payload.photos, dbPhotos)
        if (!hasCover && pairs <= 0 && photos <= 0) fail('Добавьте хотя бы одно фото — обложку, пару «до/после» или фото в галерею. Без фото работу не показать')
      }
    }

    if (collection === 'bmw_bodies') {
      const { years_from: from, years_to: to } = merged
      if (from && to && to < from) fail('Год окончания раньше года начала')
    }

    if (collection === 'site_settings') {
      const phone = merged.phone
      if (phone && (/x/i.test(phone) || /^\+?0+$/.test(phone) || /0{6,}/.test(phone))) fail('Похоже на номер-заглушку — укажите настоящий телефон')
      if (merged.whatsapp && !phone) fail('Для WhatsApp нужен телефон')

      const socials = typeof merged.socials === 'string' ? JSON.parse(merged.socials) : merged.socials
      if (Array.isArray(socials)) {
        if (socials.length > 6) fail('Соцсетей — не больше 6')
        for (const s of socials) {
          if (!s?.type || !s?.label || !s?.handle) fail('У соцсети укажите, что это за соцсеть, подпись и ник')
          if (!isHttps(s.url)) fail(`Ссылка на соцсеть «${s.label}» должна начинаться с https://`)
        }
      }
      const locations = typeof merged.locations === 'string' ? JSON.parse(merged.locations) : merged.locations
      if (Array.isArray(locations)) {
        if (locations.length > 4) fail('Адресов — не больше 4')
        for (const l of locations) {
          if (!l?.kind || !l?.name || !l?.city || !l?.address) fail('У адреса заполните тип, название, город и адрес')
          for (const k of ['yandex_maps_url', 'twogis_url']) if (l[k] && !isHttps(l[k])) fail(`Ссылка на карту у «${l.name}» должна начинаться с https://`)
          if (l.yandex_rating != null && (l.yandex_rating < 1 || l.yandex_rating > 5)) fail(`Рейтинг у «${l.name}» — от 1,0 до 5,0`)
        }
      }
    }
  }

  for (const event of ['items.create', 'items.update']) {
    filter(event, async (payload, meta, { database }) => {
      if (!COLLECTIONS.includes(meta.collection) || !payload || typeof payload !== 'object') return payload
      cleanPayload(meta.collection, payload)
      // Новая запись встаёт первой. С пустым sort она тоже первая, но первое перетаскивание
      // в отфильтрованном списке ставит её не туда, куда показала админка
      if (event === 'items.create' && SORTED.includes(meta.collection) && payload.sort == null) {
        const row = await database(meta.collection).min({ min: 'sort' }).first()
        payload.sort = row?.min == null ? 1 : row.min - 1
      }
      const keys = event === 'items.create' ? [undefined] : (meta.keys ?? [undefined])
      for (const key of keys) await checkItem(meta.collection, payload, key, database)
      return payload
    })
  }

  // 4. Обновление сайта. Не Flow: операция «Webhook / Request» идёт через IMPORT_IP_DENY_LIST, а он
  // по умолчанию запрещает адреса самого сервера — сайт на 127.0.0.1 недостижим. Снимать запрет ради
  // вебхука нельзя: тот же список защищает «импорт файла по ссылке» от запросов во внутренние сервисы.
  let timer = null
  const pending = new Set()
  function revalidate(collection) {
    if (!env.SITE_URL || !env.REVALIDATE_SECRET) return
    pending.add(collection)
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const collections = [...pending]
      pending.clear()
      try {
        const res = await fetch(`${env.SITE_URL}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.REVALIDATE_SECRET },
          body: JSON.stringify({ collection: collections.join(',') }),
        })
        if (!res.ok) logger.warn(`gal-hooks: сайт ответил ${res.status} на обновление (${collections.join(', ')})`)
      } catch (error) {
        logger.warn(`gal-hooks: сайт недоступен для обновления: ${error.message}`)
      }
    }, 800)
  }
  for (const event of ['items.create', 'items.update', 'items.delete']) {
    action(event, ({ collection }) => {
      if (COLLECTIONS.includes(collection) || ['part_positions_bmw_bodies', 'works_files'].includes(collection)) revalidate(collection)
    })
  }
  for (const event of ['files.update', 'files.delete']) action(event, () => revalidate('directus_files'))

  action('files.upload', async ({ key }, { database }) => {
    try {
      const row = await database('directus_files').select('filename_disk', 'type', 'storage').where({ id: key }).first()
      const format = IMAGE_TYPES[row?.type]
      if (!format || row.storage !== 'local') return
      const { default: sharp } = await import('sharp')
      sharp.cache(false)
      sharp.concurrency(1)
      const file = path.join(env.STORAGE_LOCAL_ROOT, row.filename_disk)
      const meta = await sharp(file).metadata()
      const rotated = (meta.orientation ?? 1) >= 5
      const width = rotated ? meta.height : meta.width
      const height = rotated ? meta.width : meta.height
      if (Math.max(width, height) <= MAX_SIDE) return

      const tmp = `${file}.resize`
      const out = await sharp(file)
        .rotate()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
        .toFormat(format, format === 'png' ? { compressionLevel: 9 } : { quality: 85 })
        .toFile(tmp)
      await rename(tmp, file)
      const { size } = await stat(file)
      await database('directus_files').where({ id: key }).update({ width: out.width, height: out.height, filesize: size })
      logger.info(`gal-hooks: ${row.filename_disk} ${width}×${height} → ${out.width}×${out.height}`)
    } catch (error) {
      logger.error(`gal-hooks: не удалось уменьшить файл ${key}: ${error.message}`)
    }
  })
}
