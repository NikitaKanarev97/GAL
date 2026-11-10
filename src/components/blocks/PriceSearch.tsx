'use client'

/*
 * Вход в прайс внутри блока Gal service (вариант B, /lab/price-block): одно поле без кнопки.
 * Первая буква — сразу на /service с этим запросом: фокус и следующие буквы переезжают эстафетой (lib/search-handoff),
 * там поиск продолжается, а кузов и мотор уточняются строкой над результатами. Частый запрос — ссылка в прайс.
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { plural } from '@/lib/format'
import { startHandoff } from '@/lib/search-handoff'
import { useContact } from '../contact/ContactProvider'
import { Icon } from '../icons/Icon'
import styles from './PriceSearch.module.css'

const QUICK = ['Колодки', 'ГРМ', 'Сцепление', 'Амортизаторы', 'Помпа', 'Кондиционер']
const EXAMPLES = ['колодки', 'замена масла', 'ГРМ', 'сцепление', 'помпа', 'стойки', 'генератор']

export const PRICE_SEARCH_ANCHOR = 'price-search'
const target = (q: string) => `/service?q=${encodeURIComponent(q)}#${PRICE_SEARCH_ANCHOR}`

export function PriceSearch({ count }: { count: number }) {
  const router = useRouter()
  const { bodies, body } = useContact()
  const [value, setValue] = useState('')
  const [typed, setTyped] = useState('')
  const [focused, setFocused] = useState(false)
  const leaving = useRef(false)
  const fieldRef = useRef<HTMLLabelElement>(null)

  // прайс загружен заранее — переход на первой букве без задержки
  useEffect(() => router.prefetch('/service'), [router])

  // пример в подсказке печатается и стирается по буквам — видно, что сюда пишут.
  // Только пока блок на экране, поле пустое и не в фокусе; «меньше движения» — первый пример целиком
  useEffect(() => {
    if (value || focused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(EXAMPLES[0])
      return
    }
    let timer = 0
    let word = 0
    let len = 0
    let deleting = false
    const tick = () => {
      const target = EXAMPLES[word]
      len += deleting ? -1 : 1
      setTyped(target.slice(0, len))
      let delay = deleting ? 35 : 75
      if (!deleting && len === target.length) {
        deleting = true
        delay = 1500
      } else if (deleting && len === 0) {
        deleting = false
        word = (word + 1) % EXAMPLES.length
        delay = 350
      }
      timer = window.setTimeout(tick, delay)
    }
    const io = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer)
      if (entry.isIntersecting) timer = window.setTimeout(tick, 600)
    })
    if (fieldRef.current) io.observe(fieldRef.current)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [value, focused])

  const go = (q: string) => {
    if (leaving.current) return
    leaving.current = true
    startHandoff(q)
    router.push(target(q))
  }

  const code = body?.kind === 'body' ? body.code : null

  return (
    <div className={styles.root} data-anim="price">
      <p className={`t-body ${styles.lead}`}>
        {code
          ? `Начните писать — покажем цену работы для BMW ${code}`
          : `Начните писать — найдём работу и цену. ${count} ${plural(count, 'работа', 'работы', 'работ')}, ${bodies.length} ${plural(bodies.length, 'кузов', 'кузова', 'кузовов')}`}
      </p>

      <label className={styles.field} ref={fieldRef} data-anim="field">
        <Icon name="search" className={styles.icon} data-anim="field-icon" />
        <span className="sr-only">Поиск по прайсу ремонта — откроется страница прайса</span>
        <input
          type="search"
          value={value}
          placeholder={focused ? 'Колодки, ГРМ, помпа…' : `Например, ${typed}`}
          enterKeyHint="search"
          autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setValue(e.target.value)
            if (e.target.value.trim()) go(e.target.value)
          }}
          onKeyDown={(e) => {
            // Enter в пустом поле — просто в прайс
            if (e.key === 'Enter' && !value.trim()) router.push('/service')
          }}
        />
        <span className={styles.hint} aria-hidden="true">
          {code ? `для ${code}` : 'все кузова'}
        </span>
      </label>

      <ul className={styles.quick} aria-label="Часто ищут" data-anim="chips">
        {QUICK.map((q) => (
          <li key={q}>
            <Link href={target(q)} className={styles.chip}>
              {q}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/service" className={styles.all}>
            Весь прайс <Icon name="arrowRight" />
          </Link>
        </li>
      </ul>
    </div>
  )
}
