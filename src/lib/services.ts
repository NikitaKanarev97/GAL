/* Группы услуг и поиск по ним — прайс /service (content-model.md, 4. services). */
import type { IconName } from '@/components/icons/Icon'
import type { Service, ServiceCategory } from '@/data/types'

/** Порядок плиток и подписи — те же значения в выпадающем списке админки (scripts/directus-setup.mjs) */
export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: IconName }[] = [
  { value: 'maintenance', label: 'ТО и расходники', icon: 'oil' },
  { value: 'engine', label: 'Двигатель', icon: 'engine' },
  { value: 'cooling', label: 'Охлаждение', icon: 'cooling' },
  { value: 'fuel', label: 'Зажигание и топливо', icon: 'ignition' },
  { value: 'transmission', label: 'Сцепление и КПП', icon: 'transmission' },
  { value: 'suspension', label: 'Подвеска', icon: 'suspension' },
  { value: 'steering', label: 'Рулевое', icon: 'steering' },
  { value: 'brakes', label: 'Тормоза', icon: 'brakes' },
  { value: 'electrics', label: 'Электрика', icon: 'electronics' },
  { value: 'climate', label: 'Печка и кондиционер', icon: 'climate' },
  { value: 'exhaust', label: 'Выхлоп', icon: 'exhaust' },
  { value: 'body', label: 'Кузов и стёкла', icon: 'body' },
]

const LABEL = new Map(SERVICE_CATEGORIES.map((c) => [c.value, c.label]))

export const categoryLabel = (c: ServiceCategory | null) => (c ? (LABEL.get(c) ?? null) : null)

/*
 * Поиск по прайсу. Запрос → слова → у каждого слова варианты (синонимы), вариант — одна или несколько основ,
 * все должны найтись. Основа ищется в начале слов названия («цепь» не находит «сцепление»).
 * Порядок: точное слово в названии → группа («тормоза» → вся группа по sort) → часть слова («стекло» → «стеклоочистителя»).
 * Проверка — scripts/search-check.mts (≈120 запросов клиентов): при правке словаря прогонять.
 */
export type SearchQuery = string[][][]

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, 'е')

/* Грубая основа слова: «колодки» и «колодок» → «колод», «фара» → «фар» */
const stem = (w: string) => (w.length > 6 ? w.slice(0, -2) : w.length > 3 ? w.replace(/[аеиоуыэюяьй]+$/, '') : w)

/* Фразы целиком — до разбора на слова */
const PHRASES: [RegExp, string][] = [
  [/техобслуживан\S*|техническ\S* обслуживан\S*/g, 'то'],
  [/головк\S* блока?\S*/g, 'гбц'],
  [/(подушк|опор)\S* (двигател|мотор)\S*/g, 'опора двигателя'],
  [/водян\S* насос\S*/g, 'помпа'],
  [/кислородн\S* датчик\S*/g, 'лямбда'],
  [/масл\S* (в|для) (двигател|мотор)\S*/g, 'моторного масла'],
  [/ремень генератор\S*|ремень навесн\S*/g, 'приводной ремень'],
  [/датчик\S* массов\S* расход\S*/g, 'расходомер'],
]

/*
 * Слово → варианты; keep — искать и само слово. Шаблон проверяется по нормализованному слову.
 * Вариант с пробелом — несколько основ, нужны все («бензонасос» → «топлив насос»).
 */
const WORDS: [RegExp, string[], boolean][] = [
  [/^мотор(а|у|ом|е)?$/, ['двигател'], false],
  [/^двигател/, ['мотор'], true],
  [/^акб$|^батаре/, ['аккумулятор'], false],
  [/^гур$/, ['гидроусилител'], false],
  [/^дмрв$|^массметр|^ммр$/, ['расходомер'], false],
  [/^абс$/, ['abs'], false],
  [/^бензонасос|^топливн\S*насос/, ['топлив насос'], false],
  [/^насос/, ['насос', 'помп'], false],
  [/^автомат/, ['акпп'], false],
  [/^механик/, ['мкпп'], false],
  [/^коробк|^кпп$/, ['кпп', 'акпп', 'мкпп'], false],
  [/^гранат|^шрус/, ['полуос'], false],
  [/^вискомуфт|^термомуфт/, ['вязкост муфт'], false],
  [/^бачок$|^бачк/, ['бачк'], false],
  [/^ремен|^ремн/, ['ремн'], false],
  [/^втулк|^втулок/, ['втул'], false],
  [/^стойк/, ['стойк', 'амортизатор'], false],
  [/^отопител/, ['печк'], false],
  [/^стеклоочист|^дворник|^щетк/, ['дворник', 'щет'], false],
  [/^стояноч|^ручни/, ['ручник'], false],
  [/^кислород|^лямбд/, ['лямбда'], false],
  [/^конде|^кондю|^кондиц/, ['кондиционер'], false],
  [/^с\/блок|^салентбл|^сайлент/, ['сайлентблок'], false],
  [/^тормоз/, ['тормоз'], false],
  [/^шаров/, ['шаров'], false],
  [/^подшип/, ['подшипник'], false],
  [/^перед/, ['передн'], false],
  [/^зад(ни|не)/, ['задн'], false],
]

/* Служебные слова и то, что выбирается отдельно (кузов, мотор) */
const SKIP = /^(замена|заменить|поменять|сделать|ремонт\S*|bmw|бмв|бэха|для|на|в|во|и|с|по|у|от|цена|стоимость|сколько)$|^[eе]\d{2}$|^[xх]\d$|^\d[.,]\d\S*$|^[mм]\d$/

export function tokens(query: string): SearchQuery {
  let q = normalize(query)
  for (const [re, to] of PHRASES) q = q.replace(re, to)
  return q
    .split(/[^a-zа-я0-9/.,]+/i)
    .map((w) => w.replace(/[.,]+$/, ''))
    .filter((w) => w.length > 1 && !SKIP.test(w))
    .map((w) => {
      const rule = WORDS.find(([re]) => re.test(w))
      const alts = rule ? [...(rule[2] ? [stem(w)] : []), ...rule[1]] : [stem(w)]
      return alts.map((a) => a.split(' '))
    })
}

/* Неверная раскладка: «rjkjlrb» → «колодки» */
const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`"
const RU = 'йцукенгшщзхъфывапролджэячсмитьбюё'
const toRu = (s: string) => [...s.toLowerCase()].map((ch) => RU[EN.indexOf(ch)] ?? ch).join('')

/* 3 — слово в названии (основа + до 3 букв окончания), 2 — группа, 1 — часть слова в названии или группе */
function level(parts: string[], name: string[], label: string[]) {
  let worst = 3
  for (const part of parts) {
    const strong = (ws: string[]) => ws.some((w) => w.startsWith(part) && w.length - part.length <= 3)
    // часть слова — только для основы от 4 букв: «то» не цепляет «топливного»
    const weak = (ws: string[]) => part.length >= 4 && ws.some((w) => w.startsWith(part))
    const l = strong(name) ? 3 : strong(label) ? 2 : weak(name) || weak(label) ? 1 : 0
    worst = Math.min(worst, l)
  }
  return worst
}

const wordsOf = (s: string | null | undefined) => (s ? normalize(s).split(/[^a-zа-я0-9]+/i).filter(Boolean) : [])

function score(s: Service, query: SearchQuery, all: boolean) {
  const name = wordsOf([s.name, s.description].filter(Boolean).join(' '))
  const label = wordsOf(categoryLabel(s.category))
  const levels = query.map((alts) => Math.max(...alts.map((parts) => level(parts, name, label))))
  if (all && levels.some((l) => l === 0)) return 0
  return levels.reduce((a, b) => a + b, 0)
}

/** Найденные услуги по порядку: сначала все слова запроса; ничего — хотя бы часть слов */
export function matchServices(services: Service[], query: SearchQuery, category: ServiceCategory | null) {
  const pool = category ? services.filter((s) => s.category === category) : services
  if (!query.length) return pool
  for (const all of [true, false]) {
    const ranked = pool
      .map((s, i) => ({ s, i, sc: score(s, query, all) }))
      .filter((r) => r.sc > 0)
      .sort((a, b) => b.sc - a.sc || a.i - b.i)
    if (ranked.length) return ranked.map((r) => r.s)
    if (query.length === 1) break
  }
  return []
}

/** Запрос как его понял поиск: если по латинице ничего — та же строка в русской раскладке */
export function resolveQuery(services: Service[], raw: string): SearchQuery {
  const q = tokens(raw)
  if (!/[a-z]/i.test(raw) || matchServices(services, q, null).length) return q
  const ru = tokens(toRu(raw))
  return matchServices(services, ru, null).length ? ru : q
}

/** Куски названия для подсветки: основа подсвечивается в начале слова */
export function highlight(text: string, query: SearchQuery): [string, boolean][] {
  const stems = query.flat(2)
  if (!stems.length) return [[text, false]]
  const lower = normalize(text)
  const hit = new Array<boolean>(text.length).fill(false)
  for (const st of stems) {
    for (let i = lower.indexOf(st); i !== -1; i = lower.indexOf(st, i + 1)) {
      if (i === 0 || /[^a-zа-я0-9]/i.test(lower[i - 1])) hit.fill(true, i, i + st.length)
    }
  }
  const parts: [string, boolean][] = []
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1]
    if (last && last[1] === hit[i]) last[0] += text[i]
    else parts.push([text[i], hit[i]])
  }
  return parts
}

/**
 * Цена работы для выбора на сайте:
 * exact — точная (одна на кузов или для выбранного мотора); range — кузов есть, мотор не выбран;
 * from — кузов не выбран, «другая BMW» или у услуги нет цен по кузовам; ask — для этого мотора у нас нет цены.
 */
export type ServicePriceView =
  | { kind: 'exact'; value: number }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'from'; value: number }
  | { kind: 'ask' }
  | null

export function priceFor(service: Pick<Service, 'price_from' | 'prices'>, body: string | null, motor: string | null = null): ServicePriceView {
  const from = service.price_from ? ({ kind: 'from', value: service.price_from } as const) : null
  const rows = body ? service.prices.filter((p) => p.body === body) : []
  if (!rows.length) {
    if (body || !service.prices.length) return from
    return { kind: 'from', value: Math.min(...service.prices.map((p) => p.price)) }
  }
  const whole = rows.find((p) => !p.motor)
  if (whole) return { kind: 'exact', value: whole.price }
  if (motor) {
    const own = rows.find((p) => p.motor === motor)
    return own ? { kind: 'exact', value: own.price } : { kind: 'ask' }
  }
  const values = rows.map((p) => p.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? { kind: 'exact', value: min } : { kind: 'range', min, max }
}

/** Нижняя граница — для «от» в плитках групп */
export const priceLow = (p: ServicePriceView) =>
  !p || p.kind === 'ask' ? null : p.kind === 'range' ? p.min : p.value

const NBSP = ' '
const rub = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)

/** «11 290 ₽», «10 250–15 060 ₽», «от 2 500 ₽», «по запросу» */
export function formatServicePrice(p: ServicePriceView): string | null {
  if (!p) return null
  if (p.kind === 'ask') return 'по запросу'
  if (p.kind === 'range') return `${rub(p.min)}–${rub(p.max)}${NBSP}₽`
  return `${p.kind === 'from' ? `от${NBSP}` : ''}${rub(p.value)}${NBSP}₽`
}
