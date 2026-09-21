'use client'

/*
 * 0. Шапка — structure.md §2, content.md «0. Шапка».
 * Плавающая панель со скруглением карточки; прячется при скролле вниз — motion/MotionProvider.tsx (data-anim="header").
 */
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import logo from '@assets/logo/svg/gal-logo-v3-header.svg'
import { Icon } from '../icons/Icon'
import { Dialog } from '../ui/Dialog'
import { LeadButton } from '../contact/LeadButton'
import { useContact } from '../contact/ContactProvider'
import { telegramUrl } from '@/lib/message'
import { NAV } from '@/lib/nav'
import styles from './Header.module.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings } = useContact()

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
                    <Link href={item.href} className={styles.navLink}>
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
                <Link href={item.href} className={`t-display ${styles.menuLink}`} onClick={() => setMenuOpen(false)}>
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
