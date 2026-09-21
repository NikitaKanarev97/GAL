'use client'

/*
 * Выбранный кузов — structure.md §2 блок 3: сохраняется в браузере,
 * подсвечивает позиции и попадает в сообщение Ивану.
 * Сохранённый код, которого больше нет среди опубликованных, тихо сбрасывается.
 */
import { useCallback, useSyncExternalStore } from 'react'
import type { BodyChoice } from './message'

const KEY = 'gal:body'
const listeners = new Set<() => void>()

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function write(value: string | null) {
  try {
    if (value) window.localStorage.setItem(KEY, value)
    else window.localStorage.removeItem(KEY)
  } catch {
    // приватный режим — выбор живёт до перезагрузки
    memory = value
  }
  memory = value
  listeners.forEach((l) => l())
}

let memory: string | null = null

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => e.key === KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useBodyChoice(validCodes: string[]): [BodyChoice, (choice: BodyChoice) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read() ?? memory,
    () => null,
  )

  let choice: BodyChoice = null
  if (raw === 'other') choice = { kind: 'other' }
  else if (raw && validCodes.includes(raw)) choice = { kind: 'body', code: raw }

  const set = useCallback((next: BodyChoice) => {
    write(next === null ? null : next.kind === 'other' ? 'other' : next.code)
  }, [])

  return [choice, set]
}
