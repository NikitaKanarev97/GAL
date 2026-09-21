'use client'

/*
 * Заявка Ивану — structure.md §4, content.md «Выбор темы и переход в Telegram».
 * Общие кнопки → попап выбора темы. Кнопки с известной темой → сразу Telegram,
 * если кузов выбран (или кузовов нет); иначе попап с шага «Какая BMW?».
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { BmwBody, SiteSettings } from '@/data/types'
import { useBodyChoice } from '@/lib/body-store'
import {
  buildMessage,
  generateCode,
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
      window.open(telegramUrl(settings.telegram_username, text), '_blank', 'noopener')
      trackLead({ ...ctx, body: choice, code, page: window.location.pathname })
      return text
    },
    [settings.telegram_username],
  )

  const openPicker = useCallback((source: LeadSource) => setPicker({ preset: { source } }), [])

  const startLead = useCallback(
    (ctx: LeadContext) => {
      if (body !== null || bodies.length === 0) {
        setFallback(sendLead(ctx, body))
      } else {
        setPicker({ preset: ctx })
      }
    },
    [body, bodies.length, sendLead],
  )

  const api = useMemo<ContactApi>(
    () => ({ settings, bodies, body, setBody, openPicker, startLead, sendLead }),
    [settings, bodies, body, setBody, openPicker, startLead, sendLead],
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
