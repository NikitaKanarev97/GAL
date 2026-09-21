'use client'

/*
 * Движение — research.md §3, structure.md §5.
 * Плагины регистрируются один раз здесь; компоненты берут gsap только отсюда.
 * Все плагины GSAP бесплатны с 3.13 — SplitText без лицензии.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

/** Токены движения — те же значения, что сняты с common и Webflow-сайтов */
export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  /** раскрытия масок и крупных картинок — длинный хвост */
  reveal: 'expo.out',
  wipe: 'power4.inOut',
} as const

export const DUR = { short: 0.4, base: 0.55, long: 1.1 } as const

/** Старт появления: верх элемента на 88% высоты окна */
export const START = 'top 88%'

/** Десктоп и телефон — разные сценарии; reduced-motion — отдельная ветка */
export const MQ = {
  desktop: '(min-width: 992px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 991.98px) and (prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

/*
 * Интро первого экрана стартует, когда прелоадер начал уходить
 * (или сразу, если прелоадера в этой сессии нет).
 */
declare global {
  interface Window {
    __galIntro?: boolean
  }
}

const INTRO_EVENT = 'gal:intro'

export function startIntro() {
  if (window.__galIntro) return
  window.__galIntro = true
  window.dispatchEvent(new Event(INTRO_EVENT))
}

export function onIntro(cb: () => void) {
  if (window.__galIntro) {
    cb()
    return () => {}
  }
  window.addEventListener(INTRO_EVENT, cb, { once: true })
  return () => window.removeEventListener(INTRO_EVENT, cb)
}

export { gsap, ScrollTrigger, SplitText, useGSAP }
