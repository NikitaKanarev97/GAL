'use client'

/*
 * Плавающая кнопка (телефон) — structure.md §2, content.md.
 * Видна после первого экрана. Прячется у финального блока, у футера и пока на экране есть своя кнопка связи
 * (LeadButton, data-lead): иначе ложилась поверх «Обсудить салон» и дублировала кнопку рядом. Выезжает снизу — CSS-переход.
 */
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { files } from '@/data/seed/files'
import { telegramUrl } from '@/lib/message'
import { Icon } from '../icons/Icon'
import { useContact } from '../contact/ContactProvider'
import styles from './FloatingCta.module.css'

export function FloatingCta() {
  const { settings, openPicker } = useContact()
  const [pastHero, setPastHero] = useState(false)
  const [atContacts, setAtContacts] = useState(false)
  const [ctaOnScreen, setCtaOnScreen] = useState(false)
  const avatar = settings.ivan_photo && settings.ivan_photo_consent ? files.ivanAvatar : null

  useEffect(() => {
    const hero = document.getElementById('top')
    const contacts = document.getElementById('contacts')
    const observers: IntersectionObserver[] = []
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting))
      io.observe(hero)
      observers.push(io)
    }
    if (contacts) {
      const io = new IntersectionObserver(([e]) => setAtContacts(e.isIntersecting))
      io.observe(contacts)
      observers.push(io)
    }
    const onScreen = new Set<Element>()
    const cta = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target)
        else onScreen.delete(e.target)
      }
      setCtaOnScreen(onScreen.size > 0)
    })
    document.querySelectorAll('#main [data-lead], footer').forEach((el) => cta.observe(el))
    observers.push(cta)
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const visible = pastHero && !atContacts && !ctaOnScreen

  return (
    <div className={styles.wrap} data-visible={visible} data-anim="float">
      <a
        href={telegramUrl(settings.telegram_username)}
        className={styles.button}
        aria-label="Связаться с нами в Telegram"
        aria-haspopup="dialog"
        tabIndex={visible ? undefined : -1}
        onClick={(e) => {
          e.preventDefault()
          openPicker('плавающая кнопка')
        }}
      >
        {avatar ? <Image src={avatar.src} alt="" width={32} height={32} className={styles.avatar} /> : null}
        <span className={styles.label}>Связаться</span>
        <Icon name="telegram" className={styles.icon} />
      </a>
    </div>
  )
}
