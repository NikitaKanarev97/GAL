'use client'

/*
 * Сценарии главной — structure.md §2 «анимация» по блокам.
 * gsap.matchMedia разводит десктоп и телефон (разные сценарии, а не одна анимация в двух размерах)
 * и откатывает всё при смене брейкпоинта; при prefers-reduced-motion сцены не запускаются вовсе —
 * контент стоит на месте, остаются только CSS-переходы состояний.
 */
import { MQ, ScrollTrigger, gsap, useGSAP } from '@/lib/motion'
import type { Safe, Scene } from './scenes/helpers'
import { hero } from './scenes/hero'
import { contacts, custom, directions, faq, howToOrder, marquee, models, parts, service, titles, why } from './scenes/sections'

/* порядок — сверху вниз: так ScrollTrigger правильно считает отступы пинов */
const SCENES: Scene[] = [hero, titles, directions, models, parts, marquee, howToOrder, why, service, custom, faq, contacts]

export function PageMotion() {
  useGSAP(() => {
    const root = document.getElementById('main')
    if (!root) return
    const mm = gsap.matchMedia()

    const run = (isDesktop: boolean) => (_ctx: gsap.Context, contextSafe?: gsap.ContextSafeFunc) => {
      const safe = (contextSafe ?? ((fn) => fn)) as Safe
      const cleanups = SCENES.map((scene) => scene(root, isDesktop, safe))
      ScrollTrigger.refresh()
      return () => cleanups.forEach((c) => c?.())
    }

    mm.add(MQ.desktop, run(true))
    mm.add(MQ.mobile, run(false))
    // без анимации: интро не ждём — снимаем скрытие первого экрана
    mm.add(MQ.reduced, () => {
      document.documentElement.classList.remove('motion')
    })

    return () => mm.revert()
  })

  return null
}
