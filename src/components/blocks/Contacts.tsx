/*
 * 10. Финальный блок «Свяжитесь с нами» — structure.md §2, content.md «10. Финальный блок».
 * Нет фото или согласия — блок типографикой без подписи над фото. Строки контактов — только заполненные.
 * Анимация — motion/scenes/sections.ts: блок открывается как подложка, G A L поднимаются по буквам.
 */
import type { Social, SiteSettings } from '@/data/types'
import { formatPhone } from '@/lib/format'
import { telegramUrl } from '@/lib/message'
import { CopyButton } from '../contact/CopyButton'
import { TopicFlow } from '../contact/TopicFlow'
import { Icon, type IconName } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import styles from './Contacts.module.css'

const SOCIAL_ICON: Record<Social['type'], IconName> = {
  instagram: 'instagram',
  telegram_channel: 'telegram',
  youtube: 'youtube',
  vk: 'external',
}

const formatRating = (value: number) => value.toFixed(1).replace('.', ',')

export function Contacts({ settings: s }: { settings: SiteSettings }) {
  const photo = s.ivan_photo && s.ivan_photo_consent ? s.ivan_photo : null
  const nick = `@${s.telegram_username}`

  const rows: { icon: IconName; label: string; content: React.ReactNode }[] = [
    {
      icon: 'telegram',
      label: 'Telegram',
      content: (
        <a className={styles.link} href={telegramUrl(s.telegram_username)} target="_blank" rel="noopener noreferrer" aria-label={`${nick} — откроется в новой вкладке`}>
          {nick}
        </a>
      ),
    },
  ]
  if (s.phone) {
    rows.push({
      icon: 'phone',
      label: 'Телефон',
      content: s.phone_calls ? (
        <a className={styles.link} href={`tel:${s.phone}`}>
          {formatPhone(s.phone)}
        </a>
      ) : (
        <span>{formatPhone(s.phone)} · только сообщения</span>
      ),
    })
    if (s.whatsapp) {
      rows.push({
        icon: 'whatsapp',
        label: 'WhatsApp',
        content: (
          <a className={styles.link} href={`https://wa.me/${s.phone.slice(1)}`} target="_blank" rel="noopener noreferrer" aria-label="Написать в WhatsApp — откроется в новой вкладке">
            Написать в WhatsApp
          </a>
        ),
      })
    }
  }
  // Места — списком (client-answers.md §3.3): Мизиново, Королёв
  for (const loc of [...s.locations].sort((a, b) => a.sort - b.sort)) {
    rows.push({
      icon: 'pin',
      label: loc.name,
      content: (
        <span className={styles.stack}>
          <span>{[loc.address, loc.purpose].filter(Boolean).join(' · ')}</span>
          {loc.hours ? <span className={styles.muted}>{loc.hours}</span> : null}
          {loc.visit_allowed ? (
            <span className={styles.muted}>Только по предварительной записи — напишите нам заранее</span>
          ) : null}
          {loc.yandex_maps_url || loc.twogis_url ? (
            <span className={styles.maps}>
              {loc.yandex_maps_url ? (
                <a className={styles.link} href={loc.yandex_maps_url} target="_blank" rel="noopener noreferrer" aria-label={`Яндекс Карты: ${loc.name} — откроется в новой вкладке`}>
                  Яндекс Карты
                </a>
              ) : null}
              {loc.yandex_maps_url && loc.yandex_rating ? (
                <a className={`${styles.link} ${styles.rating}`} href={loc.yandex_maps_url} target="_blank" rel="noopener noreferrer" aria-label={`Рейтинг ${formatRating(loc.yandex_rating)} на Яндекс Картах — откроется в новой вкладке`}>
                  <span aria-hidden="true">★</span> {formatRating(loc.yandex_rating)} на Яндекс Картах
                </a>
              ) : null}
              {loc.twogis_url ? (
                <a className={styles.link} href={loc.twogis_url} target="_blank" rel="noopener noreferrer">
                  2ГИС
                </a>
              ) : null}
            </span>
          ) : null}
        </span>
      ),
    })
  }
  // Соцсети — списком (client-answers.md §3.4)
  for (const social of [...s.socials].sort((a, b) => a.sort - b.sort)) {
    rows.push({
      icon: SOCIAL_ICON[social.type],
      label: social.label,
      content: (
        <a className={styles.link} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} @${social.handle} — откроется в новой вкладке`}>
          @{social.handle}
        </a>
      ),
    })
  }
  if (s.email) {
    rows.push({
      icon: 'mail',
      label: 'Почта',
      content: (
        <a className={styles.link} href={`mailto:${s.email}`}>
          {s.email}
        </a>
      ),
    })
  }

  return (
    <section id="contacts" className={styles.section} aria-labelledby="contacts-title" data-anim="underlay">
      <div className={`container ${styles.layout}`} data-photo={photo ? 'yes' : 'no'} data-anim="underlay-content">
        {photo ? (
          <figure className={styles.photoWrap} data-anim="contacts-photo">
            <Photo file={photo} alt="Мастер GAL за работой" ratio="4 / 5" sizes="(min-width: 1240px) 400px, (min-width: 992px) 33vw, 100vw" className={styles.photo} />
            <figcaption className={`t-display ${styles.photoLabel}`}>GAL на связи</figcaption>
          </figure>
        ) : null}

        <div className={styles.main} data-anim="contacts-main">
          <h2 id="contacts-title" className={`t-display ${styles.title}`} data-anim="split">
            Свяжитесь с нами
          </h2>
          <div className={styles.intro}>
            <p className="t-body">
              <span className="only-desktop">
                {s.intro ?? 'Напишите VIN и какая деталь нужна — подберём её под вашу машину и назовём цену до оплаты. Ремонт и салон — тоже к нам.'}
              </span>
              <span className="only-mobile">
                {s.intro_short ?? s.intro ?? 'VIN и деталь — подберём и назовём цену.'}
              </span>
            </p>
            {s.response_time ? <p className={`t-small ${styles.muted}`}>{s.response_time}</p> : null}
          </div>

          <div className={styles.picker}>
            {/* заголовок «С чем помочь?» — у первого шага внутри TopicFlow: на следующих шагах их было два подряд */}
            <TopicFlow preset={{ source: 'финальный блок' }} mode="inline" />
          </div>

          <div className={styles.nick}>
            <span className={styles.nickValue}>{nick}</span>
            <CopyButton value={nick} label="Скопировать" />
          </div>

          <dl className={styles.list}>
            {rows.map((r, i) => (
              <div key={`${r.label}-${i}`} className={styles.row}>
                <dt className={styles.rowLabel}>
                  <Icon name={r.icon} className={styles.rowIcon} />
                  <span>{r.label}</span>
                </dt>
                <dd className={styles.rowValue}>{r.content}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <p className={styles.letters} aria-hidden="true" data-anim="letters">
        <span>G</span>
        <span className={styles.lettersAccent}>A</span>
        <span>L</span>
      </p>
    </section>
  )
}
