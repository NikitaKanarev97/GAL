'use client'

/*
 * Плитки кузовов — structure.md §2 блок 3 и шаг «Какая BMW?».
 * layout auto: от 768px — группы по сериям, ниже — вкладки серий и ряд с прокруткой.
 */
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import type { BmwBody } from '@/data/types'
import type { BodyChoice } from '@/lib/message'
import { formatYears, seriesLabel } from '@/lib/format'
import styles from './BodyPicker.module.css'

type Props = {
  bodies: BmwBody[]
  value: BodyChoice
  onChange: (choice: BodyChoice) => void
  layout?: 'auto' | 'tabs'
  /** Перешив салона берут на любые марки — там плитка «Другая марка» */
  otherTitle?: string
  otherHint?: string
}

function groupBySeries(bodies: BmwBody[]) {
  const groups = new Map<string, BmwBody[]>()
  for (const b of bodies) groups.set(b.series, [...(groups.get(b.series) ?? []), b])
  return [...groups.entries()]
}

export function BodyPicker({
  bodies,
  value,
  onChange,
  layout = 'auto',
  otherTitle = 'Другая BMW',
  otherHint = 'модель напишете в сообщении',
}: Props) {
  const groups = groupBySeries(bodies)
  const selectedCode = value?.kind === 'body' ? value.code : null
  const initialTab = bodies.find((b) => b.code === selectedCode)?.series ?? groups[0]?.[0]
  const [tab, setTab] = useState(initialTab)
  const uid = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const tile = (b: BmwBody) => {
    const years = formatYears(b)
    const selected = selectedCode === b.code
    return (
      <li key={b.id}>
        <button
          type="button"
          className={styles.tile}
          aria-pressed={selected}
          onClick={() => onChange(selected ? null : { kind: 'body', code: b.code })}
        >
          <span className={styles.code}>
            <span className="sr-only">BMW </span>
            {b.code}
            <span className="sr-only">, {seriesLabel(b.series)},</span>
          </span>
          <span className={styles.years}>{years ?? ' '}</span>
          <span className={styles.bar} data-anim="ping" aria-hidden="true" />
        </button>
      </li>
    )
  }

  const other = (
    <li key="other">
      <button
        type="button"
        className={`${styles.tile} ${styles.other}`}
        aria-pressed={value?.kind === 'other'}
        onClick={() => onChange(value?.kind === 'other' ? null : { kind: 'other' })}
      >
        <span className={styles.otherTitle}>{otherTitle}</span>
        <span className={`${styles.years} only-desktop`}>{otherHint}</span>
        <span className={styles.bar} aria-hidden="true" />
      </button>
    </li>
  )

  const onTabKey = (e: KeyboardEvent, index: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (index + dir + groups.length) % groups.length
    setTab(groups[next][0])
    tabRefs.current[next]?.focus()
  }

  const tabs = (
    <div className={layout === 'auto' ? `${styles.tabs} ${styles.tabsOnlyMobile}` : styles.tabs}>
      <div role="tablist" aria-label="Серии BMW" className={styles.tablist}>
        {groups.map(([series], i) => (
          <button
            key={series}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${series}`}
            aria-controls={`${uid}-panel`}
            aria-selected={tab === series}
            tabIndex={tab === series ? 0 : -1}
            className={styles.tab}
            onClick={() => setTab(series)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {seriesLabel(series)}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className={styles.panel}>
        <ul className={styles.row}>
          {groups.find(([s]) => s === tab)?.[1].map(tile)}
          {other}
        </ul>
      </div>
    </div>
  )

  if (layout === 'tabs') return tabs

  return (
    <>
      {tabs}
      <div className={styles.groups}>
        {groups.map(([series, list]) => (
          <div key={series} className={styles.group} style={{ '--n': list.length } as React.CSSProperties}>
            <p className={`t-eyebrow ${styles.groupLabel}`}>{seriesLabel(series)}</p>
            <ul className={styles.wrap} data-anim="stagger">
              {list.map(tile)}
            </ul>
          </div>
        ))}
        <div className={styles.group} style={{ '--n': 1 } as React.CSSProperties}>
          <p className={`t-eyebrow ${styles.groupLabel}`} aria-hidden="true">
            &nbsp;
          </p>
          <ul className={styles.wrap}>{other}</ul>
        </div>
      </div>
    </>
  )
}
