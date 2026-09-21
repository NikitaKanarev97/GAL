'use client'

import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'

type Props = {
  value: string
  label: string
  labelShort?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  block?: boolean
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // встроенные браузеры без Clipboard API
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function CopyButton({ value, label, labelShort, variant = 'secondary', block }: Props) {
  const [state, setState] = useState<'idle' | 'ok' | 'error'>('idle')

  useEffect(() => {
    if (state !== 'ok') return
    const t = setTimeout(() => setState('idle'), 2000)
    return () => clearTimeout(t)
  }, [state])

  return (
    <>
      <Button
        variant={variant}
        icon={state === 'ok' ? 'check' : 'copy'}
        iconPosition="start"
        block={block}
        onClick={async () => setState((await copy(value)) ? 'ok' : 'error')}
      >
        {state === 'ok' ? (
          'Скопировано'
        ) : labelShort ? (
          <>
            <span className="only-desktop">{label}</span>
            <span className="only-mobile">{labelShort}</span>
          </>
        ) : (
          label
        )}
      </Button>
      <span role="status" className={state === 'error' ? 't-small' : 'sr-only'}>
        {state === 'ok' ? 'Скопировано' : state === 'error' ? 'Не получилось скопировать — выделите текст вручную' : ''}
      </span>
    </>
  )
}
