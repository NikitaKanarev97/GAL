/*
 * 1. Первый экран. Интро — после ухода прелоадера (onIntro):
 * фото раскрывается шторкой слева направо и оседает из увеличения (common hero),
 * H1 построчно из маски, затем текст, кнопки, «Движимы страстью» прописывается слева направо и повторяет это при каждом возврате к первому экрану.
 * При скролле: фото уходит медленнее страницы, текст — быстрее и гаснет (глубина).
 */
import { EASE, ScrollTrigger, SplitText, gsap, onIntro } from '@/lib/motion'
import { $, $$, type Scene, visibleVariant } from './helpers'

export const hero: Scene = (root, isDesktop, safe) => {
  const section = $(root, '#top')
  if (!section) return
  const media = $(section, '[data-anim="reveal"]')!
  const picture = $(section, '[data-anim="parallax"]')!
  const display = $(section, '[data-anim="split"]')!
  const content = $(section, '[data-anim="content"]')!
  const intro = $$(section, '[data-intro]')

  let split: SplitText | null = null

  const play = safe(() => {
    split = SplitText.create(visibleVariant(display, isDesktop), { type: 'lines', mask: 'lines', linesClass: 'split-line' })
    const tl = gsap.timeline({ defaults: { ease: EASE.reveal } })
    tl.set(intro, { visibility: 'visible' })
      .fromTo(
        media,
        { clipPath: isDesktop ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE.wipe },
        0,
      )
      .fromTo(picture, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: EASE.out }, 0)
      .from($(section, '[data-anim="eyebrow"]'), { y: 20, autoAlpha: 0, duration: 0.9 }, 0.2)
      .from(split.lines, { yPercent: 115, duration: 1.2, stagger: 0.1 }, 0.25)
      // кнопки двигаем обёрткой: у самих кнопок CSS-переход transform (нажатие), он сбивает GSAP
      .from($$(section, '[data-anim="fade"], [data-anim="actions"]'), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.6)
      .fromTo(
        $(section, '[data-anim="script"]'),
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power2.inOut' },
        0.9,
      )
      .from($(section, '[data-anim="tagline"]'), { autoAlpha: 0, x: 24, duration: 1 }, 1)

    // надпись — подпись мастера: ушли с первого экрана — стёрлась, вернулись — прописывается заново.
    // Остальное интро не повторяем: заголовок и кнопки при каждом возврате наверх раздражали бы.
    const script = $(section, '[data-anim="script"]')
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      onLeave: () => gsap.set(script, { clipPath: 'inset(0% 100% 0% 0%)' }),
      onEnterBack: () =>
        gsap.fromTo(
          script,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power2.inOut', delay: 0.15, overwrite: true },
        ),
    })
  })

  const off = onIntro(play)

  // Глубина при скролле
  gsap.to(picture, {
    yPercent: isDesktop ? 14 : 8,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
  })
  if (isDesktop) {
    gsap.to(content, {
      y: -90,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
    })
  }

  return () => {
    off()
    split?.revert()
  }
}
