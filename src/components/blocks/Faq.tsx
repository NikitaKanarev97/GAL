'use client'

/*
 * 9. Вопросы — structure.md §2, content.md «9. Вопросы». 0 вопросов — блок не рендерится (page.tsx);
 * 1 вопрос — открыт. Ответ — простой текст, абзацы через пустую строку, ссылки текстом.
 * Раскрыт всегда не больше одного: открытие вопроса закрывает предыдущий, повторный клик закрывает текущий.
 * Иначе на телефоне длинные ответы копятся стопкой и список вопросов перестаёт читаться целиком.
 * Плавная высота — CSS grid-template-rows 0fr → 1fr; закрытый ответ inert и visibility: hidden — скринридер его не читает.
 */
import { useId, useState } from 'react'
import type { Faq as FaqItem } from '@/data/types'
import { LeadButton } from '../contact/LeadButton'
import { Icon } from '../icons/Icon'
import { SectionTitle } from '../ui/SectionTitle'
import styles from './Faq.module.css'

type Props = { items: FaqItem[] }

export function Faq({ items }: Props) {
  const uid = useId()
  const [open, setOpen] = useState<string | null>(() => (items.length === 1 ? items[0].id : null))

  const toggle = (id: string) => setOpen((prev) => (prev === id ? null : id))

  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <SectionTitle id="faq-title" title="Вопросы" subtitle="Не нашли свой вопрос — спросите нас." />
          <div className="only-desktop">
            <LeadButton lead={{ source: 'вопросы' }} variant="secondary" icon="telegram">
              Спросить нас
            </LeadButton>
          </div>
        </div>
        <ul className={styles.list} data-anim="accordion">
          {items.map((item) => {
            const isOpen = open === item.id
            return (
              <li key={item.id} className={styles.item}>
                <h3 className={styles.question}>
                  <button
                    type="button"
                    className={styles.trigger}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-${item.id}`}
                    id={`${uid}-${item.id}-q`}
                    onClick={() => toggle(item.id)}
                  >
                    <span>{item.question}</span>
                    <span className={styles.plus} aria-hidden="true">
                      <Icon name="plus" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${uid}-${item.id}`}
                  role="region"
                  aria-labelledby={`${uid}-${item.id}-q`}
                  className={styles.answer}
                  data-open={isOpen}
                  inert={!isOpen}
                >
                  <div className={styles.answerInner}>
                    {item.answer.split(/\n\s*\n/).map((para, i) => (
                      <p key={i} className="t-body">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="only-mobile">
          <LeadButton lead={{ source: 'вопросы' }} variant="secondary" icon="telegram" block>
            Спросить нас
          </LeadButton>
        </div>
      </div>
    </section>
  )
}
