'use client'

/*
 * Шаги выбора темы — content.md «Выбор темы»: тема → кузов → сообщение.
 * Пропущенные шаги не показываются; если остался один шаг — индикатора нет.
 */
import { useId, useMemo, useRef, useState, useEffect, useSyncExternalStore, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  MESSAGE_HINT,
  buildMessage,
  generateCode,
  type BodyChoice,
  type LeadContext,
  type LeadSource,
  type Topic,
} from '@/lib/message'
import { SHEET_QUERY, useDialogHeaderSlot } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Icon } from '../icons/Icon'
import { BodyPicker } from './BodyPicker'
import { TelegramFallback } from './TelegramFallback'
import { useContact } from './ContactProvider'
import styles from './TopicFlow.module.css'

export type FlowPreset = Partial<Omit<LeadContext, 'source'>> & { source: LeadSource }

type Step = 'topic' | 'body' | 'message'

const TOPICS: { value: Topic; title: string; hint: string; hintShort: string }[] = [
  { value: 'parts', title: 'Запчасть', hint: 'Деталь в наличии или под заказ', hintShort: 'В наличии или под заказ' },
  { value: 'repair', title: 'Ремонт', hint: 'Ремонт или установка в Gal service', hintShort: 'В Gal service' },
  { value: 'custom', title: 'Перешив салона', hint: 'Руль, сиденья, потолок, торпедо в Gal custom', hintShort: 'В Gal custom' },
  { value: 'other', title: 'Другое', hint: 'Вопрос не из этого списка', hintShort: 'Другой вопрос' },
]

type Props = {
  preset: FlowPreset
  mode: 'dialog' | 'inline'
}

// «Назад» и «Шаг n из m» уходят в шапку листа там, где попап — лист (телефон и планшет)
const PHONE = SHEET_QUERY
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function TopicFlow({ preset, mode }: Props) {
  const { bodies, body, setBody, sendLead } = useContact()
  const uid = useId()

  // набор шагов фиксируется при открытии и заново — при уходе с шага темы: кузов, выбранный по ходу, шаг не убирает,
  // а встроенный блок в контактах не спрашивает кузов, если его выбрали на странице уже после загрузки
  const [bodyKnown, setBodyKnown] = useState(body !== null)
  const steps = useMemo<Step[]>(() => {
    const list: Step[] = []
    if (!preset.topic) list.push('topic')
    if (bodies.length > 0 && !bodyKnown) list.push('body')
    list.push('message')
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyKnown])

  const [step, setStep] = useState<Step>(steps[0])
  const [returnToMessage, setReturnToMessage] = useState(false)
  const [topic, setTopic] = useState<Topic | null>(preset.topic ?? null)
  const [code, setCode] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const topicRefs = useRef<(HTMLButtonElement | null)[]>([])
  const headerSlot = useDialogHeaderSlot()
  const isPhone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false)

  useEffect(() => {
    if (step === 'message' && !code) setCode(generateCode())
  }, [step, code])

  // Код и подсказка «не открылся?» относятся к одному варианту сообщения: сменили тему или кузов — новый код, подсказка прячется.
  // Повторный клик по той же кнопке шлёт тот же код: превью и открытое в Telegram сообщение всегда совпадают.
  const variant = `${topic}|${body?.kind === 'body' ? body.code : (body?.kind ?? '')}`
  const lastVariant = useRef(variant)
  useEffect(() => {
    if (lastVariant.current === variant) return
    lastVariant.current = variant
    setSent(null)
    setCode(null)
  }, [variant])

  // смена шага — фокус на заголовок, чтобы скринридер прочитал новый вопрос
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const index = steps.indexOf(step)
  const showIndicator = steps.length > 1 && index >= 0
  const goNext = () => {
    if (step === 'topic') {
      setBodyKnown(body !== null)
      setStep(bodies.length > 0 && body === null ? 'body' : 'message')
      return
    }
    setStep(steps[index + 1] ?? 'message')
  }
  const goBack = () => {
    if (returnToMessage) {
      setReturnToMessage(false)
      setStep('message')
      return
    }
    setStep(steps[index - 1])
  }

  const ctx = { topic: topic ?? 'other', section: preset.section, position: preset.position }
  const message = buildMessage(ctx, body, code)

  // встроенный блок стоит внутри секции «Свяжитесь с нами» (h2) — его шаги на уровень ниже
  const Heading = mode === 'inline' ? 'h3' : 'h2'
  const heading = (text: string) => (
    <Heading id={`${uid}-title`} ref={headingRef} tabIndex={-1} className={`t-display t-h3 ${styles.heading}`}>
      {text}
    </Heading>
  )

  // Радиогруппа темы: стрелки переключают и выбирают, Tab попадает только в выбранный (или первый) вариант
  const onTopicKey = (e: KeyboardEvent, i: number) => {
    const last = TOPICS.length - 1
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? (i + 1) % TOPICS.length
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? (i - 1 + TOPICS.length) % TOPICS.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    setTopic(TOPICS[next].value)
    topicRefs.current[next]?.focus()
  }
  const focusableTopic = Math.max(
    0,
    TOPICS.findIndex((t) => t.value === topic),
  )

  const navInHeader = mode === 'dialog' && isPhone && headerSlot !== null
  const nav =
    (showIndicator || returnToMessage) && (index > 0 || returnToMessage || mode === 'dialog') ? (
      <div className={navInHeader ? `${styles.nav} ${styles.navInHeader}` : styles.nav}>
        {index > 0 || returnToMessage ? (
          <Button variant="ghost" icon="arrowLeft" iconPosition="start" onClick={goBack}>
            Назад
          </Button>
        ) : (
          <span />
        )}
        {showIndicator && !returnToMessage ? (
          <span className={`t-eyebrow ${styles.indicator}`}>
            Шаг {index + 1} из {steps.length}
          </span>
        ) : null}
      </div>
    ) : null

  return (
    <div className={styles.root} data-mode={mode}>
      {/* на телефоне и планшете «Назад» и «Шаг n из m» — в шапке листа, а не отдельной строкой под пустой шапкой */}
      {navInHeader && nav ? createPortal(nav, headerSlot) : nav}

      {step === 'topic' ? (
        <section aria-labelledby={`${uid}-title`} className={styles.step}>
          {heading('С чем помочь?')}
          {mode === 'dialog' ? <p className={`t-small ${styles.sub} only-desktop`}>Сразу поймём, о чём разговор</p> : null}
          <div role="radiogroup" aria-label="Тема" className={styles.topics}>
            {TOPICS.map((t, i) => (
              <button
                key={t.value}
                ref={(el) => {
                  topicRefs.current[i] = el
                }}
                type="button"
                role="radio"
                aria-checked={topic === t.value}
                tabIndex={i === focusableTopic ? 0 : -1}
                className={styles.topic}
                onClick={() => setTopic(t.value)}
                onKeyDown={(e) => onTopicKey(e, i)}
              >
                <span className={styles.radio} aria-hidden="true">
                  <Icon name="check" />
                </span>
                <span className={styles.topicTitle}>{t.title}</span>
                <span className={`t-small ${styles.topicHint}`}>
                  <span className="only-desktop">{t.hint}</span>
                  <span className="only-mobile">{t.hintShort}</span>
                </span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <Button onClick={goNext} disabled={!topic} aria-describedby={!topic ? `${uid}-hint` : undefined} icon="arrowRight">
              Дальше
            </Button>
            {!topic ? (
              <span id={`${uid}-hint`} className={`t-small ${styles.sub}`}>
                Выберите тему
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 'body' ? (
        <section aria-labelledby={`${uid}-title`} className={styles.step}>
          {heading('Какая BMW?')}
          <p className={`t-small ${styles.sub}`}>
            <span className="only-desktop">Кузов попадёт в сообщение — не придётся объяснять</span>
            <span className="only-mobile">Кузов попадёт в сообщение</span>
          </p>
          <BodyPicker bodies={bodies} value={body} onChange={setBody} layout="tabs" />
          <div className={styles.actions}>
            <Button
              onClick={() => {
                setReturnToMessage(false)
                setStep('message')
              }}
              disabled={body === null}
              icon="arrowRight"
            >
              Дальше
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setBody(null)
                setReturnToMessage(false)
                setStep('message')
              }}
            >
              Пропустить
            </Button>
          </div>
        </section>
      ) : null}

      {step === 'message' ? (
        <section aria-labelledby={`${uid}-title`} className={styles.step}>
          {heading('Ваше сообщение')}
          <p className={`t-small ${styles.sub}`}>
            <span className="only-desktop">Откроется черновик в Telegram — допишите его и нажмите «Отправить»</span>
            <span className="only-mobile">Допишите в Telegram и нажмите «Отправить»</span>
          </p>
          <p className={styles.preview} aria-live="polite">
            {message}
          </p>
          {body !== null && bodies.length > 0 ? (
            <p className={`t-small ${styles.bodyLine}`}>
              <span>{body.kind === 'body' ? `BMW ${body.code}` : 'Другая BMW'}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => {
                  setReturnToMessage(true)
                  setStep('body')
                }}
              >
                Изменить
              </button>
            </p>
          ) : null}
          <p className={`t-small ${styles.sub}`}>
            <span className="only-desktop">{MESSAGE_HINT[ctx.topic].full}</span>
            <span className="only-mobile">{MESSAGE_HINT[ctx.topic].short}</span>
          </p>
          <div className={styles.actions}>
            <Button
              size="lg"
              icon="telegram"
              block={mode === 'dialog'}
              onClick={() => {
                const used = code ?? generateCode()
                if (!code) setCode(used)
                setSent(sendLead({ ...ctx, source: preset.source }, body as BodyChoice, used))
              }}
            >
              Открыть Telegram
            </Button>
          </div>
          {sent ? <TelegramFallback message={sent} /> : null}
        </section>
      ) : null}
    </div>
  )
}
