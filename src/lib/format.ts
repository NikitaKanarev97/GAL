/* Форматы из content.md «Словарь» и content-model.md. */
import type { BmwBody } from '@/data/types'

const NBSP = ' '

/** «от 12 000 ₽» — разряды и знак через неразрывный пробел */
export function formatPrice(value: number | null | undefined): string | null {
  if (!value) return null
  const digits = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
  return `от${NBSP}${digits}${NBSP}₽`
}

/** 1 раздел, 2–4 раздела, 5+ разделов */
export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

/** «1995–2003», «2017–н. в.», «до 2003», null */
export function formatYears(body: Pick<BmwBody, 'years_from' | 'years_to'>): string | null {
  const { years_from: from, years_to: to } = body
  if (from && to) return `${from}–${to}`
  if (from) return `${from}–н.${NBSP}в.`
  if (to) return `до ${to}`
  return null
}

/** «E39 · E60 · E61 · E63 · E64 +3 · рестайлинг» — не больше 5 кодов */
export function formatBodiesLine(codes: string[], note: string | null) {
  const shown = codes.slice(0, 5).join(' · ')
  const rest = codes.length > 5 ? ` +${codes.length - 5}` : ''
  const parts = [shown ? shown + rest : '', note ?? ''].filter(Boolean)
  return {
    short: parts.join(' · '),
    full: [codes.join(' · '), note].filter(Boolean).join(' · '),
  }
}

/** +79001234567 → +7 900 123-45-67 */
export function formatPhone(phone: string) {
  const m = phone.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/)
  return m ? `+7${NBSP}${m[1]}${NBSP}${m[2]}-${m[3]}-${m[4]}` : phone
}

export function seriesLabel(series: string) {
  return /^\d$/.test(series) ? `${series} серия` : series
}
