/*
 * 2. Три направления — structure.md §2, content.md «2. Три направления».
 * Появление — motion/scenes/sections.ts; приглушение соседей и приближение фото при наведении — CSS.
 */
import Link from 'next/link'
import { files } from '@/data/seed/files'
import { plural } from '@/lib/format'
import { Icon } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import styles from './Directions.module.css'

type Props = { sectionsCount: number; counter: string | null }

export function Directions({ sectionsCount, counter }: Props) {
  const sectionsPart = sectionsCount > 0 ? `${sectionsCount} ${plural(sectionsCount, 'раздел', 'раздела', 'разделов')} · ` : ''
  const onOrder = counter ? `${counter} деталей в наличии и под заказ` : 'детали в наличии и под заказ'
  const partsFull = `${sectionsPart}${onOrder}`
  const partsShort = onOrder

  const cards = [
    {
      key: 'parts',
      href: '#parts',
      title: 'Запчасти',
      text: partsFull,
      textShort: partsShort,
      file: files.directionsParts,
      ratio: '4 / 3',
      sizes: '(min-width: 1240px) 610px, (min-width: 768px) 50vw, 100vw',
    },
    {
      key: 'service',
      href: '#service',
      title: 'Gal service',
      text: 'Ремонт и проекты на BMW',
      textShort: 'Ремонт',
      file: files.directionsService,
      ratio: '2 / 3',
      sizes: '(min-width: 1240px) 295px, (min-width: 768px) 25vw, 50vw',
    },
    {
      key: 'custom',
      href: '#custom',
      title: 'Gal custom',
      text: 'Перешив салонов любых машин',
      textShort: 'Перешив салонов',
      file: files.directionsCustom,
      ratio: '2 / 3',
      sizes: '(min-width: 1240px) 295px, (min-width: 768px) 25vw, 50vw',
    },
  ]

  return (
    <section id="directions" className={styles.section} aria-labelledby="directions-title">
      <div className="container">
        <h2 id="directions-title" className="sr-only">
          Направления GAL
        </h2>
        <ul className={styles.grid} data-anim="cases">
          {cards.map((c) => (
            <li key={c.key} className={`${styles.item} ${styles[c.key]}`}>
              <Link href={c.href} className={styles.card}>
                <Photo file={c.file} alt="" ratio={c.ratio} sizes={c.sizes} className={styles.photo} imgClassName={styles.img} />
                <span className={styles.scrim} aria-hidden="true" />
                <span className={styles.body}>
                  <span className={`t-display ${styles.title}`}>{c.title}</span>
                  <span className={`t-small ${styles.text}`}>
                    <span className="only-desktop">{c.text}</span>
                    <span className="only-mobile">{c.textShort}</span>
                  </span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  <Icon name="arrowRight" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
