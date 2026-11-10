'use client'

/*
 * Невидимое поле каркаса для эстафеты поиска главная → /service (src/lib/search-handoff.ts).
 * Не display:none и шрифт 16px — иначе iOS не держит на нём клавиатуру или увеличивает страницу.
 * Ширина не 1px: в такой Chrome сбрасывает курсор в начало, и буквы встают задом наперёд.
 */
import { registerProxy } from '@/lib/search-handoff'

export function SearchHandoff() {
  return (
    <input
      ref={registerProxy}
      type="search"
      tabIndex={-1}
      aria-hidden="true"
      autoComplete="off"
      enterKeyHint="search"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 120,
        height: 24,
        padding: 0,
        border: 0,
        opacity: 0,
        fontSize: 16,
        pointerEvents: 'none',
      }}
    />
  )
}
