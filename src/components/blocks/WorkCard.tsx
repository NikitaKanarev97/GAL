'use client'

/*
 * Работа Service / Custom: обложка или шторка «до/после», подпись в две строки,
 * раскрытая работа — попап с описанием, парами и галереей (content-model.md §5).
 */
import { useState } from 'react'
import type { WorkView } from '@/data'
import { Dialog } from '../ui/Dialog'
import { Photo } from '../ui/Photo'
import { BeforeAfter } from './BeforeAfter'
import styles from './WorkCard.module.css'

type Props = { work: WorkView; sizes: string; counter?: string }

export function WorkCard({ work, sizes, counter }: Props) {
  const [open, setOpen] = useState(false)
  const pair = work.pairs[0]
  const spec = [work.car, work.year].filter(Boolean).join(' · ')
  const hasMore = Boolean(work.description || work.photos.length > 0 || work.pairs.length > 1)

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {pair ? (
          <BeforeAfter pair={pair} title={work.title} sizes={sizes} />
        ) : work.coverResolved ? (
          <Photo file={work.coverResolved} alt={`${work.title}, ${work.car}`} ratio="4 / 3" sizes={sizes} />
        ) : null}
      </div>
      <div className={styles.caption} data-anim="wipe">
        {counter ? (
          <span className={`t-eyebrow ${styles.counter}`} aria-hidden="true">
            {counter}
          </span>
        ) : null}
        <h4 className={styles.title}>{work.title}</h4>
        <p className={`t-small ${styles.spec}`}>{spec}</p>
      </div>
      {/* ссылка — только на пост об этой работе: на главную канала вела бы каждая карточка, это уже делает общая ссылка под проектами */}
      {work.direction === 'service' && work.post_url ? (
        <a className={styles.more} href={work.post_url} target="_blank" rel="noopener noreferrer" aria-label={`Подробнее о работе «${work.title}» в Telegram-канале — откроется в новой вкладке`}>
          Подробнее — в Telegram-канале
        </a>
      ) : work.direction !== 'service' && hasMore ? (
        <button type="button" className={styles.more} onClick={() => setOpen(true)} aria-haspopup="dialog">
          Подробнее<span className="sr-only">: {work.title}</span>
        </button>
      ) : null}

      {work.direction !== 'service' ? <Dialog open={open} onClose={() => setOpen(false)} label={`${work.title}, ${spec}`} size="lg">
        <div className={styles.detail}>
          <header className={styles.detailHead}>
            <h2 className={`t-display t-h2 ${styles.detailTitle}`}>{work.title}</h2>
            <p className={`t-small ${styles.spec}`}>{spec}</p>
          </header>
          {work.description ? <p className={`t-body ${styles.description}`}>{work.description}</p> : null}
          {work.pairs.map((p) => (
            <figure key={p.id} className={styles.figure}>
              <BeforeAfter pair={p} title={work.title} sizes="(min-width: 1080px) 1000px, 100vw" />
              {p.caption ? <figcaption className="t-small">{p.caption}</figcaption> : null}
            </figure>
          ))}
          {work.photos.length > 0 ? (
            <ul className={styles.gallery}>
              {work.photos.map((f, i) => (
                <li key={f.id}>
                  {/* галерея показывает фото целиком — пропорция файла */}
                  <Photo
                    file={f}
                    alt={`${work.title}, ${work.car} — фото ${i + 1}`}
                    ratio={`${f.width} / ${f.height}`}
                    sizes="(min-width: 1080px) 500px, 100vw"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Dialog> : null}
    </article>
  )
}
