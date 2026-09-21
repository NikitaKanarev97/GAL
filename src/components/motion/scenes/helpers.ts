import { DUR, EASE, START, SplitText, gsap } from '@/lib/motion'

/** safe — contextSafe из matchMedia: анимации, созданные позже (события, колбэки), тоже откатываются */
export type Safe = <T extends (...args: never[]) => unknown>(fn: T) => T
export type Scene = (root: HTMLElement, isDesktop: boolean, safe: Safe) => void | (() => void)

export const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)
export const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel))

/** Тексты сайта дублируются: .only-desktop / .only-mobile. Анимируем ту версию, что видна. */
export function visibleVariant(el: HTMLElement, isDesktop: boolean): HTMLElement {
  return el.querySelector<HTMLElement>(isDesktop ? '.only-desktop' : '.only-mobile') ?? el
}

/**
 * Заголовок построчно из маски (bloomblex h2-reveal, common): строки выезжают снизу.
 * autoSplit пересобирает строки после шрифтов и ресайза — анимация создаётся в onSplit.
 */
export function revealLines(
  el: HTMLElement,
  isDesktop: boolean,
  vars: { trigger?: Element; start?: string; delay?: number; stagger?: number; scroll?: boolean } = {},
) {
  const target = visibleVariant(el, isDesktop)
  const { trigger = el, start = START, delay = 0, stagger = 0.09, scroll = true } = vars
  return SplitText.create(target, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'split-line',
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 115,
        duration: DUR.long,
        ease: EASE.reveal,
        stagger,
        delay,
        scrollTrigger: scroll ? { trigger, start, toggleActions: 'play none none none' } : undefined,
      }),
  })
}

/** Появление подъёмом — для абзацев, кнопок, строк списков */
export function rise(targets: gsap.TweenTarget, trigger: Element, vars: gsap.TweenVars & { start?: string } = {}) {
  const { start = START, ...tween } = vars
  return gsap.from(targets, {
    y: 36,
    autoAlpha: 0,
    duration: DUR.long,
    ease: EASE.reveal,
    stagger: 0.08,
    scrollTrigger: { trigger, start, toggleActions: 'play none none none' },
    ...tween,
  })
}

/** Раскрытие рамки с фото: шторка clip-path + фото внутри «оседает» из увеличения (common hero) */
export function revealFrame(
  frame: HTMLElement,
  vars: { from?: string; trigger?: Element; delay?: number; scroll?: boolean } = {},
) {
  const { from = 'inset(0% 0% 100% 0%)', trigger = frame, delay = 0, scroll = true } = vars
  const img = frame.querySelector('img')
  // у фото в CSS переход transform (приближение при наведении) — на время анимации выключаем
  if (img) gsap.set(img, { transition: 'none' })
  const tl = gsap.timeline({
    delay,
    scrollTrigger: scroll ? { trigger, start: START, toggleActions: 'play none none none' } : undefined,
    onComplete: () => {
      // снять инлайн-трансформ: иначе CSS-приближение при наведении не сработает
      if (img) gsap.set(img, { clearProps: 'transform,transition' })
      gsap.set(frame, { clearProps: 'clipPath' })
    },
  })
  tl.fromTo(frame, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE.wipe })
  if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: EASE.out }, 0)
  return tl
}
