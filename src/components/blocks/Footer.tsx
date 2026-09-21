/* 11. Футер — structure.md §2, content.md «11. Футер». Без реквизитов строка скрыта. */
import Image from 'next/image'
import Link from 'next/link'
import logo from '@assets/logo/svg/gal-logo-v3-header.svg'
import type { SiteSettings } from '@/data/types'
import { NAV } from '@/lib/nav'
import styles from './Footer.module.css'

export function Footer({ settings: s }: { settings: SiteSettings }) {
  const legal =
    s.legal_form && s.legal_name && s.inn
      ? [`${s.legal_form} ${s.legal_name}`, `ИНН ${s.inn}`, s.ogrn ? `ОГРН ${s.ogrn}` : null].filter(Boolean).join(' · ')
      : null

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" aria-label="GAL — наверх" className={styles.logo}>
            <Image src={logo} alt="" className={styles.logoImg} />
          </Link>
          <p className={`t-script ${styles.script}`}>Движимы страстью</p>
        </div>

        <nav aria-label="Меню в подвале">
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`t-small ${styles.meta}`}>
          {legal ? <p>{legal}</p> : null}
          <p>
            <Link href="/privacy" className={styles.link}>
              Политика конфиденциальности
            </Link>
          </p>
          <p className={styles.muted}>
            Цены на сайте — ориентир «от». Точную цену на вашу машину назовём в переписке. Сайт не является публичной офертой.
          </p>
          <p className={styles.muted}>© {new Date().getFullYear()} GAL</p>
        </div>
      </div>
    </footer>
  )
}
