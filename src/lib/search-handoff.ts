'use client'

/*
 * Эстафета поиска: главная → /service без потери клавиатуры и букв.
 * Поиск на главной на первой букве отдаёт фокус невидимому полю каркаса (SearchHandoff в layout — переживает переход),
 * клавиатура телефона остаётся открытой, буквы копятся там. Прайс забирает текст и переводит фокус в своё поле:
 * перевод фокуса между полями при открытой клавиатуре iOS разрешает, а открыть её заново без касания — нет.
 */
let proxy: HTMLInputElement | null = null

export function registerProxy(el: HTMLInputElement | null) {
  proxy = el
}

/** Главная: передать набранное и фокус полю каркаса */
export function startHandoff(value: string) {
  const el = proxy
  if (!el) return
  // сначала фокус, потом текст: иначе Chrome ставит курсор в начало, и следующие буквы встают перед набранными
  el.value = ''
  el.focus({ preventScroll: true })
  el.value = value
  const toEnd = () => {
    try {
      el.setSelectionRange(el.value.length, el.value.length)
    } catch {}
  }
  toEnd()
  requestAnimationFrame(toEnd)
}

/** Прайс: забрать текст, если эстафета идёт (фокус в поле каркаса); иначе null */
export function takeHandoff(): string | null {
  if (!proxy || document.activeElement !== proxy) return null
  const value = proxy.value
  proxy.value = ''
  return value
}
