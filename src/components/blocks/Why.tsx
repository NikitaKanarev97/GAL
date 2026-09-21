/* 6. Почему GAL — structure.md §2, content.md «6. Почему GAL». Доводы 1–3 — ответ 3 клиента, цифры — stats (ответ 4). */
import type { Stat } from '@/data/types'
import { HexBadge } from '../icons/HexBadge'
import type { IconName } from '../icons/Icon'
import { SectionTitle } from '../ui/SectionTitle'
import styles from './Why.module.css'

type Props = { stats: Stat[]; counter: string | null }

export function Why({ stats, counter }: Props) {
  const reasons: { icon: IconName; title: string; text: string }[] = [
    {
      icon: 'fit',
      title: 'Подбор по VIN до продажи',
      text: 'Сами проверяем, подойдёт ли деталь к вашей машине, — не придётся гадать по объявлению.',
    },
    {
      icon: 'tested',
      title: 'Каждая деталь проверена',
      text: 'Перед продажей проверяем деталь на работоспособность, моем и готовим — на разборках это редкость.',
    },
    { icon: 'wrench', title: 'Сразу поставим', text: 'Деталь можно установить в Gal service — без поиска мастера и лишней возни.' },
    {
      icon: 'order',
      title: 'Нет в разделах — найдём',
      text: counter
        ? `На складе и под заказ — ${counter} деталей. Чего нет, привезём из Дубая, Англии или США.`
        : 'Чего нет на складе, привезём из Дубая, Англии или США.',
    },
  ]

  return (
    <section id="why" className="section" aria-labelledby="why-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.head}>
          <SectionTitle id="why-title" title="Почему пишут сюда, а не листают объявления" titleShort="Почему GAL" anim="highlight" />
          {stats.length > 0 ? (
            <dl className={styles.stats}>
              {stats.map((s) => (
                <div key={s.id} className={styles.stat}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className={styles.statValue} data-anim="count" data-value={s.value}>
                    <span data-count-value>{s.value}</span>
                    {s.suffix}
                  </dd>
                  <dd className={`t-small ${styles.statLabel}`} aria-hidden="true">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <ul className={styles.list} data-anim="stagger">
          {reasons.map((r) => (
            <li key={r.title} className={styles.item}>
              <HexBadge name={r.icon} />
              <h3 className={`t-h3 ${styles.title}`}>{r.title}</h3>
              <p className={`t-body ${styles.text}`}>{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
