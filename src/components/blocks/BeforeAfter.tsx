'use client'

/*
 * Шторка «до/после» — structure.md §2 блок 8. Перетаскивание по всему кадру
 * (touch-action: pan-y — вертикальный скролл страницы не ломается), клавиатура — ползунок.
 * Подсказка «Потяните, чтобы сравнить» — один раз на браузер.
 */
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { WorkPair } from '@/data/types'
import styles from './BeforeAfter.module.css'

const HINT_KEY = 'gal:compare-hint'

type Props = { pair: WorkPair; title: string; sizes: string }

export function BeforeAfter({ pair, title, sizes }: Props) {
  const [pos, setPos] = useState(50)
  const [hint, setHint] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const dragging = useRef<number | null>(null)

  useEffect(() => {
    try {
      setHint(!window.localStorage.getItem(HINT_KEY))
    } catch {
      setHint(true)
    }
  }, [])

  const dismissHint = () => {
    if (!hint) return
    setHint(false)
    try {
      window.localStorage.setItem(HINT_KEY, '1')
    } catch {}
  }

  const setFromX = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div
      ref={frame}
      className={styles.frame}
      data-anim="frame"
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return
        dragging.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        setFromX(e.clientX)
        dismissHint()
      }}
      onPointerMove={(e) => {
        if (dragging.current === e.pointerId) setFromX(e.clientX)
      }}
      onPointerUp={() => (dragging.current = null)}
      onPointerCancel={() => (dragging.current = null)}
    >
      <Image
        src={pair.after.src}
        alt={`После: ${title}`}
        fill
        sizes={sizes}
        className={styles.img}
        draggable={false}
        data-comparison-image
        style={pair.after_alignment ? {
          transform: `translate(${pair.after_alignment.x}%, ${pair.after_alignment.y}%) scale(${pair.after_alignment.scale})`,
        } : undefined}
      />
      <div className={styles.before} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={pair.before.src} alt={`До: ${title}`} fill sizes={sizes} className={styles.img} draggable={false} data-comparison-image />
      </div>

      <span className={`t-eyebrow ${styles.label} ${styles.labelBefore}`} aria-hidden="true">
        До
      </span>
      <span className={`t-eyebrow ${styles.label} ${styles.labelAfter}`} aria-hidden="true">
        После
      </span>

      <span className={styles.handle} style={{ left: `${pos}%` }} aria-hidden="true">
        <span className={styles.knob} />
      </span>

      {hint ? (
        <span className={`t-small ${styles.hint}`} aria-hidden="true">
          Потяните, чтобы сравнить
        </span>
      ) : null}

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(pos)}
        onChange={(e) => {
          setPos(Number(e.target.value))
          dismissHint()
        }}
        aria-label={`Сравнить до и после: ${title}`}
        aria-valuetext={`${Math.round(pos)}% — до`}
        className={styles.range}
      />
    </div>
  )
}
