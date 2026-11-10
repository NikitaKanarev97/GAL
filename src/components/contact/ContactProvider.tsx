'use client'

/*
 * Заявка Ивану — structure.md §4, content.md «Выбор темы и переход в Telegram».
 * Общие кнопки → попап выбора темы. Кнопки с известной темой, если кузов выбран (или кузовов нет):
 * на телефоне — сразу Telegram с текстом в поле ввода и плашка «Telegram не открылся?»;
 * на компьютере — попап с шага «Ваше сообщение»: чат там открывается пустым, и до перехода человек
 * должен увидеть, что текст скопирован и его надо вставить, — уведомление на брошенной вкладке он не видит.
 * Кузов не выбран — попап с шага «Какая BMW?».
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BmwBody, SiteSettings } from '@/data/types'
import { useBodyChoice } from '@/lib/body-store'
import { copyText } from '@/lib/clipboard'
import {
  buildMessage,
  generateCode,
  prefillSupported,
  recipientFor,
  telegramUrl,
  trackLead,
  type BodyChoice,
  type LeadContext,
  type LeadSource,
} from '@/lib/message'
import { createPortal } from 'react-dom'
import { DIALOG_EVENT, Dialog } from '../ui/Dialog'
import { TopicFlow, type FlowPreset } from './TopicFlow'
import { FallbackBar } from './FallbackBar'

type ContactApi = {
  settings: SiteSettings
  bodies: BmwBody[]
  body: BodyChoice
  setBody: (choice: BodyChoice) => void
  openPicker: (source: LeadSource) => void
  startLead: (ctx: LeadContext) => void
  /** открыть Telegram с набранным сообщением; возвращает отправленный текст */
  sendLead: (ctx: LeadContext, body: BodyChoice, code?: string) => string
  /** текст, который удалось положить в буфер при открытии Telegram */
  copied: string | null
  /** ник, которому ушла последняя заявка, — его показывает «Telegram не открылся?» */
  recipient: string
}

const ContactContext = createContext<ContactApi | null>(null)

export function useContact() {
  const api = useContext(ContactContext)
  if (!api) throw new Error('useContact вне ContactProvider')
  return api
}

type Props = { settings: SiteSettings; bodies: BmwBody[]; children: ReactNode }

export function ContactProvider({ settings, bodies, children }: Props) {
  const codes = useMemo(() => bodies.map((b) => b.code), [bodies])
  const [body, setBody] = useBodyChoice(codes)
  const [picker, setPicker] = useState<PickerState | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [recipient, setRecipient] = useState(settings.telegram_username)
  const [fallback, setFallback] = useState<string | null>(null)
  // Плашка кладётся в верхний открытый <dialog>: showModal выносит попап в top layer, и плашка из body оставалась под ним.
  // Попап закрылся — плашка переезжает обратно в body (событие шлёт ui/Dialog).
  const [fallbackHost, setFallbackHost] = useState<Element | null>(null)
  useEffect(() => {
    if (!fallback) return
    const pick = () => setFallbackHost([...document.querySelectorAll('dialog[open]')].at(-1) ?? document.body)
    pick()
    window.addEventListener(DIALOG_EVENT, pick)
    return () => window.removeEventListener(DIALOG_EVENT, pick)
  }, [fallback])
  // сохранённый кузов скрыли — тихо сбрасываем
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('gal:body')
      if (raw && raw !== 'other' && !codes.includes(raw)) setBody(null)
    } catch {}
  }, [codes, setBody])

  const sendLead = useCallback(
    (ctx: LeadContext, choice: BodyChoice, code = generateCode()) => {
      const text = buildMessage(ctx, choice, code)
      // ?text= — только телефону (prefillSupported); буфер — всем. Копируем до window.open: новая вкладка уводит фокус, а без фокуса буфер недоступен
      setCopied(null)
      copyText(text).then((ok) => ok && setCopied(text))
      const to = recipientFor(settings, ctx.topic)
      setRecipient(to)
      window.open(telegramUrl(to, prefillSupported() ? text : undefined), '_blank', 'noopener')
      trackLead({ ...ctx, body: choice, code, page: window.location.pathname })
      return text
    },
    [settings],
  )

  const openPicker = useCallback((source: LeadSource) => setPicker({ preset: { source } }), [])

  const startLead = useCallback(
    (ctx: LeadContext) => {
      if (prefillSupported() && (body !== null || bodies.length === 0)) {
        setFallback(sendLead(ctx, body))
      } else {
        setPicker({ preset: ctx })
      }
    },
    [body, bodies.length, sendLead],
  )

  const api = useMemo<ContactApi>(
    () => ({ settings, bodies, body, setBody, openPicker, startLead, sendLead, copied, recipient }),
    [settings, bodies, body, setBody, openPicker, startLead, sendLead, copied, recipient],
  )

  return (
    <ContactContext.Provider value={api}>
      {children}
      <Dialog open={picker !== null} onClose={() => setPicker(null)} label="Связаться с нами">
        {picker ? <TopicFlow preset={picker.preset} mode="dialog" /> : null}
      </Dialog>
      {fallback && fallbackHost
        ? createPortal(<FallbackBar key={fallback} message={fallback} onDone={() => setFallback(null)} />, fallbackHost)
        : null}
    </ContactContext.Provider>
  )
}

type PickerState = { preset: FlowPreset }
