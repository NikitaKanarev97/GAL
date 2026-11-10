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

/*
 * Мотор выбранного кузова — второй шаг прайса /service: точная цена работы (Service.prices с motor).
 * Хранится вместе с кузовом («E36:2.5i»): сменили кузов — мотор сброшен.
 */
const MOTOR_KEY = 'gal:motor'
const motorListeners = new Set<() => void>()
let motorMemory: string | null = null

function readMotor(): string | null {
  try {
    return window.localStorage.getItem(MOTOR_KEY)
  } catch {
    return motorMemory
  }
}

function subscribeMotor(listener: () => void) {
  motorListeners.add(listener)
  const onStorage = (e: StorageEvent) => e.key === MOTOR_KEY && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    motorListeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** Записать мотор кузова вне хука — заход по ссылке /service?body=E36&motor=2.5i */
export function saveMotor(body: string, motor: string | null) {
  const stored = motor ? `${body}:${motor}` : null
  try {
    if (stored) window.localStorage.setItem(MOTOR_KEY, stored)
    else window.localStorage.removeItem(MOTOR_KEY)
  } catch {}
  motorMemory = stored
  motorListeners.forEach((l) => l())
}

export function useMotorChoice(body: string | null, validMotors: string[]): [string | null, (motor: string | null) => void] {
  const raw = useSyncExternalStore(subscribeMotor, readMotor, () => null)
  const [savedBody, motor] = raw?.split(':') ?? []
  const value = body && savedBody === body && motor && validMotors.includes(motor) ? motor : null

  const set = useCallback((next: string | null) => (body ? saveMotor(body, next) : undefined), [body])

  return [value, set]
}
