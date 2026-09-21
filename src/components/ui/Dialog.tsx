'use client'

/*
 * Попап на нативном <dialog showModal>: фон инертен, фокус внутри.
 * Esc, клик вне, возврат фокуса, блокировка скролла без сдвига — structure.md §3, §5.
 * На телефоне и планшете — лист снизу без крестика: закрывается свайпом вниз (за шапку или за содержимое, прокрученное до верха)
 * и тапом вне листа. Крестик остаётся для клавиатуры — проявляется при фокусе. На десктопе — панель по центру с крестиком.
 * Вход — CSS @starting-style: подложка проявляется, лист выезжает снизу, на десктопе панель всплывает; выход мгновенный.
 * data-lenis-prevent — прокрутка внутри попапа нативная, плавный скролл страницы её не перехватывает.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../icons/Icon'
import { lockScroll } from '@/lib/scroll-lock'
import styles from './Dialog.module.css'

type Props = {
  open: boolean
  onClose: () => void
  /** доступное имя попапа */
  label: string
  closeLabel?: string
  size?: 'md' | 'lg'
  /** куда вернуть фокус; по умолчанию — туда, где он был до открытия */
  returnFocus?: () => HTMLElement | null
  /** шапка листа: зона свайпа, рядом с крестиком */
  header?: ReactNode
  children: ReactNode
}

/** Шапка листа как слот: содержимое попапа может вынести туда свою навигацию (contact/TopicFlow на телефоне) */
const HeaderSlotContext = createContext<HTMLElement | null>(null)
export const useDialogHeaderSlot = () => useContext(HeaderSlotContext)

/** открытие и закрытие любого попапа — по нему плашка «Telegram не открылся?» выбирает, где ей быть (contact/ContactProvider) */
export const DIALOG_EVENT = 'gal:dialog'

/*
 * Чем пользовались последним — пальцем/мышью или клавиатурой. Фокус после закрытия возвращается всегда (доступность),
 * но рамку фокуса показываем только клавиатурным: после касания она оставалась висеть на бургере в шапке.
 */
let lastInput: 'pointer' | 'keyboard' = 'pointer'
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => (lastInput = 'pointer'), true)
  window.addEventListener('keydown', () => (lastInput = 'keyboard'), true)
}

function returnFocusTo(target: HTMLElement | null) {
  if (!target) return
  if (lastInput === 'pointer') {
    target.setAttribute('data-quiet-focus', '')
    target.addEventListener('blur', () => target.removeAttribute('data-quiet-focus'), { once: true })
  }
  target.focus({ preventScroll: true })
}

const SWIPE_DISTANCE = 120
const SWIPE_VELOCITY = 0.11
/* где попап — лист снизу (Dialog.module.css) */
export const SHEET_QUERY = '(max-width: 991.98px)'
const isSheet = () => window.matchMedia(SHEET_QUERY).matches

export function Dialog({ open, onClose, label, closeLabel = 'Закрыть', size = 'md', returnFocus, header, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const pressedBackdrop = useRef(false)
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const returnFocusRef = useRef(returnFocus)
  onCloseRef.current = onClose
  returnFocusRef.current = returnFocus

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    const previous = document.activeElement as HTMLElement | null
    if (!dialog.open) dialog.showModal()
    window.dispatchEvent(new Event(DIALOG_EVENT))
    const unlock = lockScroll()

    const onCancel = (e: Event) => {
      e.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', onCancel)

    return () => {
      dialog.removeEventListener('cancel', onCancel)
      if (dialog.open) dialog.close()
      window.dispatchEvent(new Event(DIALOG_EVENT))
      unlock()
      const target = returnFocusRef.current?.() ?? previous
      // после смены маршрута элемент может появиться на кадр позже
      requestAnimationFrame(() => returnFocusTo(target))
    }
  }, [open])

  const bodyRef = useRef<HTMLDivElement>(null)

  /** отпустили лист: утащили далеко или смахнули быстро — закрыть, иначе вернуть на место */
  const release = (dy: number, startedAt: number) => {
    if (!panelRef.current) return
    const velocity = dy / (performance.now() - startedAt)
    panelRef.current.style.transform = ''
    if (dy >= SWIPE_DISTANCE || (dy > 16 && velocity > SWIPE_VELOCITY)) onCloseRef.current()
  }

  // Свайп вниз по шапке листа — телефон и планшет; pointer-события, чтобы тянуть и мышью
  const drag = useRef<{ y: number; t: number; id: number } | null>(null)

  const onHandleDown = (e: React.PointerEvent) => {
    if (!isSheet()) return
    if ((e.target as HTMLElement).closest('button, a')) return
    drag.current = { y: e.clientY, t: performance.now(), id: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onHandleMove = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId || !panelRef.current) return
    const dy = Math.max(0, e.clientY - drag.current.y)
    panelRef.current.style.transform = `translateY(${dy}px)`
  }

  const onHandleUp = (e: React.PointerEvent) => {
    if (!drag.current) return
    const { y, t } = drag.current
    drag.current = null
    release(Math.max(0, e.clientY - y), t)
  }

  /*
   * Свайп вниз за содержимое: если оно прокручено до верха, тянем лист, а не прокрутку.
   * touch-события, а не pointer: у прокручиваемой области браузер забирает жест себе и шлёт pointercancel.
   */
  useEffect(() => {
    const body = bodyRef.current
    if (!open || !body) return
    let start: { y: number; t: number } | null = null
    let pulling = false
    const onStart = (e: TouchEvent) => {
      start = isSheet() && body.scrollTop <= 0 && e.touches.length === 1 ? { y: e.touches[0].clientY, t: performance.now() } : null
      pulling = false
    }
    const onMove = (e: TouchEvent) => {
      if (!start || !panelRef.current) return
      const dy = e.touches[0].clientY - start.y
      if (!pulling) {
        // вверх или содержимое уже прокручено — обычная прокрутка
        if (dy <= 0 || body.scrollTop > 0) {
          start = null
          return
        }
        pulling = true
        start = { y: e.touches[0].clientY, t: performance.now() }
        return
      }
      e.preventDefault()
      panelRef.current.style.transform = `translateY(${Math.max(0, dy)}px)`
    }
    const onEnd = (e: TouchEvent) => {
      if (start && pulling) release(Math.max(0, e.changedTouches[0].clientY - start.y), start.t)
      start = null
      pulling = false
    }
    body.addEventListener('touchstart', onStart, { passive: true })
    body.addEventListener('touchmove', onMove, { passive: false })
    body.addEventListener('touchend', onEnd)
    body.addEventListener('touchcancel', onEnd)
    return () => {
      body.removeEventListener('touchstart', onStart)
      body.removeEventListener('touchmove', onMove)
      body.removeEventListener('touchend', onEnd)
      body.removeEventListener('touchcancel', onEnd)
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={label}
      data-anim="backdrop"
      data-lenis-prevent
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedBackdrop.current) onClose()
      }}
    >
      <div ref={panelRef} className={`${styles.panel} ${styles[size]}`} data-anim="sheet">
        <div
          className={styles.head}
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <span className={styles.grabber} aria-hidden="true" />
          <div ref={setHeaderSlot} className={styles.headContent}>
            {header}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <Icon name="close" />
          </button>
        </div>
        <div ref={bodyRef} className={styles.body}>
          <HeaderSlotContext.Provider value={headerSlot}>{children}</HeaderSlotContext.Provider>
        </div>
      </div>
    </dialog>
  )
}
