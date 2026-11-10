'use client'

/*
 * 0. Шапка — structure.md §2, content.md «0. Шапка».
 * Плавающая панель со скруглением карточки; прячется при скролле вниз — motion/MotionProvider.tsx (data-anim="header").
 */
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import logo from '@assets/logo/svg/gal-logo-v3-header.svg'
import { Icon } from '../icons/Icon'
import { Dialog } from '../ui/Dialog'
import { LeadButton } from '../contact/LeadButton'
import { useContact } from '../contact/ContactProvider'
import { telegramUrl } from '@/lib/message'
import { NAV } from '@/lib/nav'
import styles from './Header.module.css'

/* Линия «где читатель»: секция активна, пока пересекает эту долю высоты окна */
const SPY_LINE = 0.35

/*
 * Активный пункт меню. Отдельная страница (/service, /parts/…) — по адресу;
 * на главной — по секции под линией SPY_LINE. Между секциями меню (Why, FAQ) — ни один.
 */
function useActiveNav(): string | null {
  const pathname = usePathname()
  const [section, setSection] = useState<string | null>(null)
  const onHome = pathname === '/'

  useEffect(() => {
    if (!onHome) return
    const ids = NAV.filter((i) => i.href.startsWith('/#')).map((i) => i.href.slice(2))
    let frame = 0
    const measure = () => {
      frame = 0
      const line = window.innerHeight * SPY_LINE
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      let current: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) current = id
        if (atBottom && r.bottom > 0) current = id
      }
      setSection(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [onHome])

  if (onHome) return section ? `/#${section}` : null
  if (pathname.startsWith('/parts/')) return '/#parts'
  return NAV.find((i) => i.href === pathname)?.href ?? null
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings } = useContact()
  const active = useActiveNav()
  const current = (href: string) => (href === active ? (href.startsWith('/#') ? 'location' : 'page') : undefined)

  return (
    <>
      <a href="#main" className={styles.skip}>
        Перейти к содержимому
      </a>
      <header className={styles.header} data-anim="header">
        <div className="container">
          <div className={styles.panel}>
            <Link href="/" className={styles.logo} aria-label="GAL — наверх">
              <Image src={logo} alt="" priority className={styles.logoImg} />
            </Link>

            <nav aria-label="Основное меню" className={styles.nav}>
              <ul>
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.navLink} aria-current={current(item.href)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.actions}>
              <LeadButton lead={{ source: 'шапка' }} icon="telegram" className={styles.cta}>
                Связаться
              </LeadButton>
              <button
                type="button"
                className={styles.burger}
                aria-label="Открыть меню"
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="burger" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} label="Меню" closeLabel="Закрыть меню">
        <nav aria-label="Меню" className={styles.menu}>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`t-display ${styles.menuLink}`}
                  aria-current={current(item.href)}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuFooter}>
            <LeadButton lead={{ source: 'шапка' }} icon="telegram" block size="lg">
              Связаться с нами
            </LeadButton>
            <a className={styles.nick} href={telegramUrl(settings.telegram_username)} target="_blank" rel="noopener noreferrer">
              @{settings.telegram_username}
            </a>
          </div>
        </nav>
      </Dialog>
    </>
  )
}
