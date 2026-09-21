/*
 * Блокировка скролла без сдвига вёрстки: html держит scrollbar-gutter: stable
 * (globals.css), поэтому overflow: hidden не убирает место под скроллбар.
 * Счётчик — попапы могут открываться поверх друг друга.
 */
let locks = 0

export function lockScroll() {
  locks += 1
  if (locks === 1) document.documentElement.setAttribute('data-scroll-locked', '')
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0) document.documentElement.removeAttribute('data-scroll-locked')
  }
}
