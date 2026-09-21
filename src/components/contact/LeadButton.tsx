'use client'

/*
 * Единая кнопка связи и её контекстные подписи.
 * Без JS — обычная ссылка на личку; с JS — выбор темы или сразу Telegram с сообщением.
 */
import type { ReactNode } from 'react'
import type { IconName } from '../icons/Icon'
import type { LeadContext, LeadSource } from '@/lib/message'
import { telegramUrl } from '@/lib/message'
import { Button } from '../ui/Button'
import { useContact } from './ContactProvider'

type Props = {
  /** известная тема → startLead; только source → попап выбора темы */
  lead: LeadContext | { source: LeadSource }
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  icon?: IconName
  block?: boolean
  className?: string
  'aria-label'?: string
}

export function LeadButton({ lead, children, icon = 'arrowRight', ...rest }: Props) {
  const { settings, openPicker, startLead } = useContact()
  const general = !('topic' in lead)
  // data-lead: по метке плавающая кнопка прячется, пока такая кнопка на экране (blocks/FloatingCta)

  return (
    <Button
      href={telegramUrl(settings.telegram_username)}
      icon={icon}
      aria-haspopup={general ? 'dialog' : undefined}
      data-lead=""
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        if ('topic' in lead) startLead(lead)
        else openPicker(lead.source)
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}
