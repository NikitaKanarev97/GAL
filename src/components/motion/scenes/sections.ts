/*
 * Сцены блоков ниже первого экрана — structure.md §2, паттерны из research.md §3.
 * Каждая сцена ищет свои data-anim внутри секции; нет секции — ничего не делает (пустые состояния).
 */
import { DUR, EASE, START, ScrollTrigger, SplitText, gsap } from '@/lib/motion'
import { $, $$, type Scene, revealFrame, revealLines, rise, visibleVariant } from './helpers'

/* Заголовки H2 всех блоков: строки из маски, оранжевая черта вырастает, подзаголовок поднимается */
export const titles: Scene = (root, isDesktop) => {
  const splits: SplitText[] = []
  for (const title of $$(root, '[data-anim="title"]')) {
    const h = $(title, '[data-anim="split"]')
    if (h) {
      splits.push(revealLines(h, isDesktop))
      gsap.fromTo(
        h,
        { '--bar': 0 },
        { '--bar': 1, duration: 0.9, ease: EASE.out, scrollTrigger: { trigger: h, start: START, toggleActions: 'play none none none' } },
      )
    }
    const rest = $$(title, '[data-anim="subtitle"], [data-anim="eyebrow"]')
    if (rest.length) rise(rest, title, { delay: 0.25 })
  }
  // отдельные H2 вне SectionTitle: Custom — по обычному порогу, Contacts — когда подложка уже открылась
  for (const h of $$(root, '#custom [data-anim="split"]')) splits.push(revealLines(h, isDesktop))
  const contactsTitle = $(root, '#contacts [data-anim="split"]')
  if (contactsTitle) splits.push(revealLines(contactsTitle, isDesktop, { trigger: $(root, '#contacts')!, start: 'top 45%' }))
  return () => splits.forEach((s) => s.revert())
}

/* 2. Направления: карточки раскрываются шторкой снизу по очереди; приглушение соседей — CSS */
export const directions: Scene = (root) => {
  const grid = $(root, '#directions [data-anim="cases"]')
  if (!grid) return
  $$(grid, ':scope > li').forEach((li, i) => revealFrame(li, { trigger: grid, delay: i * 0.12 }))
}

/* 3. Выбор кузова: плитки встают волной */
export const models: Scene = (root) => {
  const section = $(root, '#models')
  if (!section) return
  const tiles = $$(section, 'li')
  if (tiles.length) rise(tiles, tiles[0], { y: 24, stagger: 0.035, duration: DUR.base * 1.6 })
}

/* 4. Разделы: плитки пачками по рядам; плашка 5000+ раскрывается от центра, одометр крутит цифры */
export const parts: Scene = (root, isDesktop) => {
  const section = $(root, '#parts')
  if (!section) return

  const tiles = $$(section, '[data-anim="stagger"] > li')
  if (tiles.length) {
    gsap.set(tiles, { y: 70, autoAlpha: 0 })
    ScrollTrigger.batch(tiles, {
      start: START,
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: DUR.long, ease: EASE.reveal, stagger: 0.08 })
        const imgs = batch.map((li) => li.querySelector('img')).filter(Boolean)
        if (imgs.length)
          gsap.fromTo(
            imgs,
            { scale: 1.25, transition: 'none' },
            { scale: 1, duration: 1.5, ease: EASE.out, stagger: 0.08, clearProps: 'transform,transition' },
          )
      },
    })
  }

  const plate = $(section, '[data-anim="plate"]')
  if (!plate) return
  const bg = $(plate, '[data-anim="frame"] img')
  const tl = gsap.timeline({ scrollTrigger: { trigger: plate, start: 'top 80%', toggleActions: 'play none none none' } })
  tl.fromTo(plate, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: EASE.wipe })
  tl.from($$(plate, '[data-anim="plate-body"] > *'), { y: 30, autoAlpha: 0, duration: 1, ease: EASE.reveal, stagger: 0.1 }, 0.5)

  // одометр: в каждой ячейке — лента цифр; чем правее разряд, тем больше оборотов (как в счётчике пробега)
  const digits = $$(plate, '[data-anim="odometer"] [data-digit]')
  digits.forEach((digit, i) => {
    const final = Number(digit.dataset.digit)
    const seq: number[] = []
    for (let turn = 0; turn < 1 + i; turn++) for (let n = 0; n < 10; n++) seq.push(n)
    for (let n = 0; n <= final; n++) seq.push(n)
    digit.innerHTML = seq.map((n) => `<span>${n}</span>`).join('')
    digit.setAttribute('data-rolling', '')
    tl.fromTo(digit, { yPercent: 0 }, { yPercent: -(seq.length - 1) * 100, duration: 1.8 + i * 0.35, ease: 'power3.inOut' }, 0.4)
  })
  const suffix = $(plate, '[data-anim="odometer-suffix"]')
  if (suffix) tl.from(suffix, { scale: 0.4, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.2)' }, '>-0.3')

  if (bg) {
    gsap.fromTo(
      bg,
      { scale: 1.2, yPercent: -6 },
      { yPercent: 6, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  }

  return () => {
    digits.forEach((digit) => {
      digit.textContent = digit.dataset.digit ?? ''
      digit.removeAttribute('data-rolling')
    })
  }
}

/* 5. Как заказать: карточки наезжают стопкой (Kalstore / scrib3 services) — предыдущая уходит вглубь и темнеет */
export const howToOrder: Scene = (root, isDesktop) => {
  const list = $(root, '#how [data-anim="stack"]')
  if (!list) return
  const cards = $$(list, ':scope > li')
  /*
   * Триггеры — по потоку списка, а не по самим карточкам: карточки sticky, и при пересчёте (ресайз, шрифты)
   * ScrollTrigger мерил прилипшую карточку со сдвигом — на планшете и телефоне 01 оставалась повёрнутой,
   * а следующая наезжала на предыдущую раньше, чем выпрямлялась. Место карточки в потоке = высоты и зазоры до неё.
   */
  const flowTop = (i: number) => {
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0
    return cards.slice(0, i).reduce((sum, c) => sum + c.offsetHeight + gap, 0)
  }
  const stickyTop = (card: HTMLElement) => parseFloat(getComputedStyle(card).top) || 0
  // на узком экране путь до прилипания короче: карточка выпрямляется раньше и поворачивается слабее
  const enter = isDesktop ? { y: 120, rotate: 4, end: '55%' } : { y: 64, rotate: 2.5, end: '72%' }

  cards.forEach((card, i) => {
    const next = cards[i + 1]
    // появление: карточка заезжает с поворотом и выпрямляется до того, как дойдёт до стопки
    gsap.fromTo(
      card,
      { y: enter.y, rotate: i % 2 ? -enter.rotate : enter.rotate },
      {
        y: 0,
        rotate: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: list,
          start: () => `top+=${flowTop(i)} bottom`,
          end: () => `top+=${flowTop(i)} ${enter.end}`,
          scrub: isDesktop ? 0.6 : true,
          invalidateOnRefresh: true,
        },
      },
    )
    if (!next) return
    /*
     * Предыдущая уходит вглубь, пока следующая едет к своему месту в стопке. Десктоп — от низа экрана.
     * Планшет и телефон — с момента, когда следующая начинает наезжать на прилипшую: на высоком экране
     * карточки видны целиком и раньше гасли, ещё не перекрытые.
     */
    const overlapStart = () => {
      const gap = parseFloat(getComputedStyle(list).rowGap) || 0
      return `${stickyTop(card) + card.offsetHeight + gap}px`
    }
    gsap.to(card, {
      scale: 0.9,
      '--dim': 0.65,
      ease: 'none',
      scrollTrigger: {
        trigger: list,
        start: () => `top+=${flowTop(i + 1)} ${isDesktop ? 'bottom' : overlapStart()}`,
        end: () => `top+=${flowTop(i + 1)} ${stickyTop(next)}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
  })
}

/* 6. Почему GAL: заголовок проявляется по словам вслед за скроллом (scrib3 / common), цифры досчитывают, доводы встают */
export const why: Scene = (root, isDesktop) => {
  const section = $(root, '#why')
  if (!section) return
  let split: SplitText | null = null

  const h = $(section, '[data-anim="highlight"]')
  if (h) {
    // строки — только для построчного наклона (globals.css .skew-line), анимируются слова
    split = SplitText.create(visibleVariant(h, isDesktop), { type: 'lines, words', linesClass: 'skew-line', autoSplit: true })
    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: h, start: 'top 85%', end: isDesktop ? 'top 35%' : 'top 45%', scrub: true },
      },
    )
  }

  for (const stat of $$(section, '[data-anim="count"]')) {
    const value = Number(stat.dataset.value)
    const counter = { n: 0 }
    const out = $(stat, '[data-count-value]')
    if (!out || !Number.isFinite(value)) continue
    gsap.to(counter, {
      n: value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: stat, start: START, toggleActions: 'play none none none' },
      onUpdate: () => (out.textContent = String(Math.round(counter.n))),
    })
  }

  const items = $$(section, '[data-anim="stagger"] > li')
  if (items.length) {
    rise(items, items[0], { y: 50, stagger: 0.12 })
    gsap.from(
      items.map((li) => li.firstElementChild),
      {
        rotate: -120,
        scale: 0.5,
        duration: 1.3,
        ease: 'back.out(1.6)',
        stagger: 0.12,
        scrollTrigger: { trigger: items[0], start: START, toggleActions: 'play none none none' },
      },
    )
  }

  return () => {
    split?.revert()
    for (const stat of $$(section, '[data-anim="count"] [data-count-value]'))
      stat.textContent = stat.closest<HTMLElement>('[data-anim="count"]')?.dataset.value ?? ''
  }
}

/* 7. Gal service: фото мастерской открывается справа и дышит параллаксом, услуги строками, проекты подъёмом */
export const service: Scene = (root) => {
  const section = $(root, '#service')
  if (!section) return
  const photo = $(section, '[data-anim="top"] > [data-anim="frame"]')
  if (photo) {
    revealFrame(photo, { from: 'inset(0% 0% 0% 100%)' })
  }
  const intro = $$(section, '[data-anim="intro"] > :not([data-anim="title"])')
  if (intro.length) rise(intro, intro[0], { delay: 0.2 })
  const rows = $$(section, '[data-anim="stagger"] > li')
  if (rows.length) rise(rows, rows[0], { y: 24, stagger: 0.06, x: -12 })
  const works = $$(section, '[data-anim="works"] > li')
  if (works.length) rise(works, works[0], { y: 80, stagger: 0.12 })
}

/*
 * 8. Gal custom: баннер «вырастает» из маленькой рамки до полного размера за скроллом (scrib3 «Experience meets passion»);
 * десктоп — лента работ на пине едет по горизонтали (common Projects), телефон — поток с «проявлением» подписи.
 */
export const custom: Scene = (root, isDesktop) => {
  const section = $(root, '#custom')
  if (!section) return

  const banner = $(section, '[data-anim="banner"]')
  const media = $(section, '[data-anim="frame"]')
  if (banner && media) {
    const img = $(media, 'img')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: banner, start: 'top bottom', end: isDesktop ? 'center 60%' : 'top 30%', scrub: 0.8 },
    })
    tl.fromTo(
      banner,
      { clipPath: isDesktop ? 'inset(18% 26% 18% 26% round 24px)' : 'inset(10% 12% 10% 12% round 16px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' },
    )
    if (img) tl.fromTo(img, { scale: 1.45 }, { scale: 1, ease: 'none' }, 0)
    rise($$(banner, '[data-anim="banner-body"] > :not(h2)'), banner, { start: 'top 55%', stagger: 0.07 })
  }

  const viewport = $(section, '[data-anim="pin"]')
  const track = $(section, '[data-anim="track"]')
  const slides = $$(section, '[data-anim="track"] > li')

  if (isDesktop && viewport && track) {
    viewport.setAttribute('data-pinned', '')
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: viewport,
        start: 'center center',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    })
    // фото внутри рамки едет навстречу ленте — глубина (common)
    for (const li of slides) {
      const frame = $(li, '[data-anim="frame"]')
      if (!frame) continue
      gsap.fromTo(
        frame,
        { '--shift': '-8%' },
        {
          '--shift': '8%',
          ease: 'none',
          scrollTrigger: { trigger: li, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
        },
      )
    }
    rise(slides, viewport, { x: 160, y: 0, stagger: 0.1, start: 'top 80%' })
    return () => viewport.removeAttribute('data-pinned')
  }

  for (const li of slides) {
    rise(li, li, { y: 60 })
    const caption = $(li, '[data-anim="wipe"]')
    if (caption) {
      gsap.fromTo(
        caption,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE.wipe, scrollTrigger: { trigger: caption, start: START, toggleActions: 'play none none none' } },
      )
    }
  }
}

/* 9. Вопросы: строки встают по очереди (плавная высота — CSS, Faq.module.css) */
export const faq: Scene = (root) => {
  const items = $$(root, '#faq [data-anim="accordion"] > li')
  if (items.length) rise(items, items[0], { y: 30, stagger: 0.07 })
}

/*
 * 10. Контакты: блок лежит «под» страницей — содержимое въезжает медленнее скролла и открывается (common Footer underlay);
 * гигантские G A L поднимаются снизу по буквам (scrib3 Footer-appearing).
 */
export const contacts: Scene = (root) => {
  const section = $(root, '#contacts')
  if (!section) return
  const layout = $(section, '[data-anim="underlay-content"]')
  if (layout) {
    gsap.fromTo(
      layout,
      { y: () => -Math.min(window.innerHeight * 0.35, 320) },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 35%', scrub: true, invalidateOnRefresh: true },
      },
    )
  }
  const photo = $(section, '[data-anim="contacts-photo"]')
  if (photo) revealFrame(photo, { from: 'inset(100% 0% 0% 0%)' })

  const blocks = $$(section, '[data-anim="contacts-main"] > :not(h2)')
  if (blocks.length) rise(blocks, blocks[0], { stagger: 0.08 })

  const letters = $$(section, '[data-anim="letters"] > span')
  if (letters.length) {
    gsap.fromTo(
      letters,
      { yPercent: 105 },
      {
        yPercent: 0,
        ease: 'none',
        stagger: 0.15,
        scrollTrigger: { trigger: letters[0].parentElement, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
      },
    )
  }
}

/* Бегущая строка: скорость и направление следуют за скроллом (scrib3 marquee) */
export const marquee: Scene = (root) => {
  const tweens: gsap.core.Tween[] = []
  for (const band of $$(root, '[data-anim="marquee"] [data-band]')) {
    const track = $(band, '[data-track]')
    if (!track) continue
    const dir = Number(band.dataset.band) || 1
    const t = gsap.fromTo(
      track,
      { xPercent: dir === 1 ? 0 : -50 },
      { xPercent: dir === 1 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 },
    )
    // запас повторов назад: при скролле вверх лента едет в обратную сторону и не упирается в начало
    t.totalTime(t.duration() * 500)
    tweens.push(t)
  }
  if (!tweens.length) return
  let current = 1
  ScrollTrigger.create({
    trigger: $(root, '[data-anim="marquee"]'),
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity()
      const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 250)
      current = self.direction
      tweens.forEach((t) => gsap.to(t, { timeScale: current * boost, duration: 0.2, overwrite: true }))
      tweens.forEach((t) => gsap.to(t, { timeScale: current, duration: 1.2, delay: 0.2, ease: 'power2.out' }))
    },
  })
}
