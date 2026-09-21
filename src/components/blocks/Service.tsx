/*
 * 7. Gal service — structure.md §2, content.md «7. Gal service».
 * Пустые: нет проектов — только услуги; нет услуг — текст и кнопка. Больше 8 услуг — «Все услуги (n)».
 */
import type { Service as ServiceItem, SiteSettings } from '@/data/types'
import type { WorkView } from '@/data'
import { files } from '@/data/seed/files'
import { LeadButton } from '../contact/LeadButton'
import { HexBadge } from '../icons/HexBadge'
import { Icon } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import { SectionTitle } from '../ui/SectionTitle'
import { ServiceRow } from './ServiceRow'
import { WorkCard } from './WorkCard'
import styles from './Service.module.css'

type Props = { services: ServiceItem[]; works: WorkView[]; settings: SiteSettings }

const VISIBLE = 8

/* строка кликабельна — ServiceRow: сообщение «Ремонт → услуга» */
const serviceRow = (s: ServiceItem) => <ServiceRow key={s.id} service={s} />

export function Service({ services, works, settings }: Props) {
  const image = settings.service_image ?? files.serviceWorkshop
  const workshop = settings.locations.find((l) => l.kind === 'workshop')
  const head = services.slice(0, VISIBLE)
  const rest = services.slice(VISIBLE)
  const channel = settings.socials.find((s) => s.type === 'telegram_channel')

  return (
    <section id="service" className="section" aria-labelledby="service-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.top} data-anim="top">
          <div className={styles.intro} data-anim="intro">
            <SectionTitle id="service-title" title="Gal service" eyebrow="Ремонт BMW" />
            <p className={`t-body ${styles.text}`}>
              <span className="only-desktop">
                Своя мастерская{workshop?.city_prepositional ? ` ${workshop.city_prepositional}` : ''}. Подберём и привезём деталь и поставим её
                здесь же — с гарантией 2 недели. Вашу деталь тоже поставим, но без гарантии.
              </span>
              <span className="only-mobile">Своя мастерская. Подберём деталь и поставим.</span>
            </p>
            {/* Гарантия 2 недели на нашу деталь при установке в Gal service (Ваня, 2026-09-16) */}
            <p className={styles.badge}>
              <HexBadge name="warranty" />
              <span className="t-small">Гарантия 2 недели при установке у нас</span>
            </p>
            <div className={styles.cta}>
              <LeadButton lead={{ topic: 'repair', source: 'Gal service' }} size="lg" icon="telegram">
                Обсудить ремонт
              </LeadButton>
              <p className={`t-small ${styles.hint}`}>
                <span className="only-desktop">Опишите, что с машиной, и приложите кузов или VIN</span>
                <span className="only-mobile">Что с машиной + кузов или VIN</span>
              </p>
            </div>
          </div>
          <Photo
            file={image}
            alt="BMW на подъёмнике в мастерской"
            ratio="3 / 2"
            sizes="(min-width: 1240px) 610px, (min-width: 992px) 50vw, 100vw"
            className={styles.photo}
          />
        </div>

        {services.length > 0 ? (
          <div className={styles.block}>
            <h3 className={`t-eyebrow ${styles.subhead}`}>Что делаем</h3>
            <ul className={styles.list} data-anim="stagger">
              {head.map(serviceRow)}
            </ul>
            {rest.length > 0 ? (
              <details className={styles.more}>
                <summary className={styles.moreToggle}>
                  <span className={styles.moreOpen}>Все услуги ({services.length})</span>
                  <span className={styles.moreClose}>Свернуть</span>
                </summary>
                <ul className={styles.list}>{rest.map(serviceRow)}</ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {works.length > 0 ? (
          <div className={styles.block}>
            <h3 className={`t-eyebrow ${styles.subhead}`}>Проекты</h3>
            <ul className={styles.works} data-anim="works">
              {works.map((w) => (
                <li key={w.id}>
                  <WorkCard work={w} sizes="(min-width: 1240px) 400px, (min-width: 768px) 33vw, 100vw" />
                </li>
              ))}
            </ul>
            {channel ? (
              <a className={styles.channel} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label="Все наши работы в Telegram-канале — откроется в новой вкладке">
                <Icon name="telegram" />
                Все наши работы — в Telegram-канале
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
