'use client'

/*
 * Строка услуги Gal service — кликабельная целиком: сразу сообщение «Ремонт → {услуга}».
 * Без JS — обычная ссылка на личку. Кузов не выбран — попап с шага «Какая BMW?» (contact/ContactProvider).
 */
import type { Service } from '@/data/types'
import { formatPrice } from '@/lib/format'
import { telegramUrl } from '@/lib/message'
import { useContact } from '../contact/ContactProvider'
import { Icon } from '../icons/Icon'
import styles from './Service.module.css'

export function ServiceRow({ service: s }: { service: Service }) {
  const { settings, startLead } = useContact()
  const meta = [formatPrice(s.price_from), s.duration].filter(Boolean).join(' · ')

  return (
    <li className={styles.row}>
      <a
        href={telegramUrl(settings.telegram_username)}
        className={styles.rowLink}
        onClick={(e) => {
          e.preventDefault()
          startLead({ topic: 'repair', section: s.name, source: 'услуга Gal service' })
        }}
      >
        <span className={styles.rowMain}>
          <span className={styles.rowName}>{s.name}</span>
          {s.description ? <span className={`t-small ${styles.rowDesc}`}>{s.description}</span> : null}
        </span>
        {meta ? <span className={styles.rowMeta}>{meta}</span> : null}
        <span className={styles.rowAction}>
          <span className="only-desktop">Обсудить</span>
          <Icon name="telegram" className={styles.rowIcon} />
        </span>
      </a>
    </li>
  )
}
