'use client'

/*
 * «Telegram не открылся?» — content.md, раздел «Если Telegram не открылся».
 * Сайт не знает, открылось ли приложение, поэтому блок всегда есть, но свёрнут в одну строку:
 * у большинства Telegram открылся, и развёрнутые варианты занимали полэкрана.
 */
import { useId, useState, useSyncExternalStore } from 'react'
import { Icon } from '../icons/Icon'
import { formatPhone } from '@/lib/format'
import { isInAppBrowser, telegramWebUrl } from '@/lib/message'
import { useContact } from './ContactProvider'
import { CopyButton } from './CopyButton'
import styles from './TelegramFallback.module.css'

const noop = () => () => {}

export function TelegramFallback({ message }: { message: string }) {
  const { settings } = useContact()
  const inApp = useSyncExternalStore(noop, isInAppBrowser, () => false)
  const nick = `@${settings.telegram_username}`
  const [open, setOpen] = useState(false)
  const uid = useId()

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={`${uid}-options`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.title}>Telegram не открылся?</span>
        <span className={styles.toggleHint}>
          {open ? 'Скрыть' : 'Показать варианты'}
          <Icon name="plus" className={styles.toggleIcon} />
        </span>
      </button>
      <div id={`${uid}-options`} className={styles.options} hidden={!open}>
        <p className="t-small">
          <span className="only-desktop">
            Скопируйте сообщение и отправьте нам в Telegram — {nick}
          </span>
          <span className="only-mobile">Скопируйте и отправьте {nick}</span>
        </p>
        <div className={styles.actions}>
          <CopyButton value={message} label="Скопировать сообщение" labelShort="Скопировать" variant="primary" />
          <CopyButton value={nick} label="Скопировать ник" labelShort="Ник" />
          <a
            className={styles.link}
            href={telegramWebUrl(settings.telegram_username)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть Telegram в браузере — откроется в новой вкладке"
          >
            <span className="only-desktop">Открыть Telegram в браузере</span>
            <span className="only-mobile">Telegram Web</span>
          </a>
        </div>
        {inApp ? (
          <p className={`t-small ${styles.note}`}>
            Если вы открыли сайт из Instagram или Авито, откройте его в обычном браузере: меню ⋯ → «Открыть в браузере»
          </p>
        ) : null}
        {settings.phone ? (
          <p className={`t-small ${styles.note}`}>
            Нет Telegram? {settings.phone_calls ? 'Позвоните' : 'Напишите'}
            {settings.whatsapp ? ' или напишите в WhatsApp' : ''}:{' '}
            <a className={styles.link} href={settings.phone_calls ? `tel:${settings.phone}` : `https://wa.me/${settings.phone.slice(1)}`}>
              {formatPhone(settings.phone)}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}
