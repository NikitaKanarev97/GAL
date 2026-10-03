/*
 * Сообщение Ивану — content.md «Шаблоны сообщения Ивану».
 * Здравствуйте! Я с сайта GAL. {Тема}{ → Раздел}{ → Позиция}. {BMW}. #{код}
 * Строки для дописывания по теме — чтобы из сайта не уходило пустое обращение:
 * «Запчасти» — {Деталь: } без позиции и VIN: (ответ 21); «Ремонт» — Что случилось: и VIN:;
 * «Перешив салона» — Что хотите изменить:; «Вопрос» — Вопрос:
 */

export type Topic = 'parts' | 'repair' | 'custom' | 'other'

export const TOPIC_IN_MESSAGE: Record<Topic, string> = {
  parts: 'Запчасти',
  repair: 'Ремонт',
  custom: 'Перешив салона',
  other: 'Вопрос',
}

/** Место кнопки — поле «Кнопка» в карточке бота (content.md) */
export type LeadSource =
  | 'шапка'
  | 'первый экран'
  | 'плавающая кнопка'
  | 'плашка 5000+'
  | 'карточка позиции'
  | 'карточка «Нет нужной?»'
  | 'пустой раздел'
  | 'Как заказать'
  | 'Gal service'
  | 'услуга Gal service'
  | 'Gal custom'
  | 'вопросы'
  | 'финальный блок'
  | '404'

/** Выбор кузова: код, «другая» или не выбран */
export type BodyChoice = { kind: 'body'; code: string } | { kind: 'other' } | null

export type LeadContext = {
  topic: Topic
  section?: string
  position?: string
  source: LeadSource
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateCode(length = 4) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

export function buildMessage(ctx: Omit<LeadContext, 'source'>, body: BodyChoice, code: string | null) {
  const path = [TOPIC_IN_MESSAGE[ctx.topic], ctx.section, ctx.position].filter(Boolean).join(' → ')
  const parts = ['Здравствуйте! Я с сайта GAL.', `${path}.`]
  if (body?.kind === 'body') parts.push(`BMW ${body.code}.`)
  if (body?.kind === 'other') parts.push(ctx.topic === 'custom' ? 'Машина — марку и модель напишу.' : 'BMW — модель напишу.')
  if (code) parts.push(`#${code}`)
  const lines = [parts.join(' ')]
  if (ctx.topic === 'parts' && !ctx.position) lines.push('Деталь: ')
  // у услуги из списка «что случилось» уже названо в первой строке
  if (ctx.topic === 'repair' && !ctx.section) lines.push('Что случилось: ')
  if (ctx.topic === 'custom') lines.push('Что хотите изменить: ')
  if (ctx.topic === 'other') lines.push('Вопрос: ')
  if (ctx.topic === 'parts' || ctx.topic === 'repair') lines.push('VIN: ')
  const text = lines.join('\n')
  // «@» в начале текста Telegram трактует как упоминание — research.md §4
  return text.startsWith('@') ? ` ${text}` : text
}

/** Подсказка под превью: что дописать в черновике по теме */
export const MESSAGE_HINT: Record<Topic, { full: string; short: string }> = {
  parts: { full: 'Допишите VIN и название детали — ответ будет точнее', short: 'Допишите VIN и деталь — ответ точнее' },
  repair: { full: 'Опишите, что случилось, и допишите VIN — ответ будет точнее', short: 'Что случилось + VIN — ответ точнее' },
  custom: { full: 'Напишите, что хотите изменить, — фото салона пришлёте в чате', short: 'Что изменить — фото пришлёте в чате' },
  other: { full: 'Напишите вопрос — ответим в Telegram', short: 'Напишите вопрос' },
}

export function telegramUrl(username: string, text?: string) {
  const base = `https://t.me/${username}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function telegramWebUrl(username: string) {
  return `https://web.telegram.org/k/#@${username}`
}

/**
 * Событие боту — этап 5 (sendBeacon на /api/lead). Сейчас только собираем payload,
 * чтобы подключение не меняло вызовов.
 */
export function trackLead(payload: LeadContext & { body: BodyChoice; code: string; page: string }) {
  if (process.env.NODE_ENV === 'development') {
    console.info('[lead → этап 5]', payload)
  }
}

export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Instagram|FBAN|FBAV|Avito/i.test(navigator.userAgent)
}
