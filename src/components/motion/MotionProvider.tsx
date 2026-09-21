'use client'

/*
 * Общий слой движения на весь сайт (layout.tsx):
 * — Lenis — плавный скролл (common), в одном тикере с GSAP, чтобы ScrollTrigger не отставал;
 * — стоп скролла, пока идёт прелоадер или открыт попап (html.is-loading / [data-scroll-locked]);
 * — плавающая шапка прячется при скролле вниз и возвращается вверх (bloomblex nav-up/down);
 * — пересчёт триггеров после шрифтов, картинок и смены маршрута.
 */
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { MQ, ScrollTrigger, gsap, useGSAP } from '@/lib/motion'

/** сколько проскроллить, прежде чем шапка начнёт прятаться, px */
const HEADER_HIDE_AFTER = 240

export function MotionProvider() {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  // Lenis + синхронизация стопа
  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return
    const html = document.documentElement

    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const sync = () => {
      const blocked = html.classList.contains('is-loading') || html.hasAttribute('data-scroll-locked')
      if (blocked) lenis.stop()
      else lenis.start()
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-scroll-locked'] })

    return () => {
      observer.disconnect()
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Пересчёт позиций: шрифты и картинки меняют высоты блоков
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  // Шапка — пересобирается на каждой странице (разная высота)
  useGSAP(
    () => {
      const header = document.querySelector<HTMLElement>('[data-anim="header"]')
      if (!header) return
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const show = gsap.quickTo(header, 'yPercent', { duration: 0.45, ease: 'power3.out' })
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            const menuOpen = document.documentElement.hasAttribute('data-scroll-locked')
            if (menuOpen) return
            // панель висит с отступом и тенью — уводим с запасом
            if (self.direction === 1 && self.scroll() > HEADER_HIDE_AFTER) show(-140)
            else if (self.direction === -1) show(0)
          },
        })
        // клавиатура: фокус на ссылке спрятанной шапки её возвращает
        const onFocus = () => show(0)
        header.addEventListener('focusin', onFocus)
        return () => header.removeEventListener('focusin', onFocus)
      })

      requestAnimationFrame(() => ScrollTrigger.refresh())
      return () => mm.revert()
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return null
}
