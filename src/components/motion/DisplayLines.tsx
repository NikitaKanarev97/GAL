'use client'

/*
 * Построчный наклон display-заголовков, которые не разбивают сцены анимации:
 * 404, /privacy, /parts/[slug] и вся главная при prefers-reduced-motion.
 * Наклон блока целиком сдвигал верхние строки вправо лесенкой; разбивка на строки .skew-line
 * наклоняет каждую строку от своей базовой линии (globals.css). Однострочные заголовки не трогаем.
 */
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { MQ, SplitText } from '@/lib/motion'

/** заголовки, которые разбивают сцены главной (motion/scenes) — там строки уже есть */
const SCENE_SPLIT = '[data-anim="split"], [data-anim="highlight"]'

function visibleTarget(el: HTMLElement) {
  const variants = el.querySelectorAll<HTMLElement>(':scope > .only-desktop, :scope > .only-mobile')
  return [...variants].find((v) => v.offsetParent !== null) ?? el
}

function isMultiline(el: HTMLElement) {
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
  return Number.isFinite(lineHeight) && el.getBoundingClientRect().height > lineHeight * 1.5
}

export function DisplayLines() {
  const pathname = usePathname()

  useEffect(() => {
    const splits: SplitText[] = []
    let cancelled = false
    const scenesRun = pathname === '/' && !window.matchMedia(MQ.reduced).matches

    document.fonts.ready.then(() => {
      if (cancelled) return
      for (const el of document.querySelectorAll<HTMLElement>('#main .t-display')) {
        if (scenesRun && el.closest(SCENE_SPLIT)) continue
        if (el.querySelector('.split-line-mask, .skew-line')) continue
        const target = visibleTarget(el)
        if (!isMultiline(target)) continue
        splits.push(SplitText.create(target, { type: 'lines', linesClass: 'skew-line', autoSplit: true }))
      }
    })

    return () => {
      cancelled = true
      splits.forEach((s) => s.revert())
    }
  }, [pathname])

  return null
}
