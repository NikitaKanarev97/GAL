import type { ReactNode } from 'react'
import styles from './SectionTitle.module.css'

type Props = {
  id?: string
  /** основной текст; короткий — телефон до 991px */
  title: ReactNode
  titleShort?: ReactNode
  subtitle?: ReactNode
  subtitleShort?: ReactNode
  eyebrow?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
  /** split — строки из маски; highlight — слова проявляются за скроллом (motion/scenes) */
  anim?: 'split' | 'highlight'
}

/** H2 с оранжевой чертой (index.html .title h2:before) + подзаголовок. Анимация — motion/scenes/sections.ts (titles). */
export function SectionTitle({ id, title, titleShort, subtitle, subtitleShort, eyebrow, as: Tag = 'h2', className, anim = 'split' }: Props) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-anim="title">
      {eyebrow ? <p className={`t-eyebrow ${styles.eyebrow}`} data-anim="eyebrow">{eyebrow}</p> : null}
      <Tag id={id} className={styles.title} data-anim={anim}>
        <span className={`t-display t-h2 ${styles.text}`}>
          {titleShort ? (
            <>
              <span className="only-desktop">{title}</span>
              <span className="only-mobile">{titleShort}</span>
            </>
          ) : (
            title
          )}
        </span>
      </Tag>
      {subtitle ? (
        <p className={`t-body ${styles.subtitle}`} data-anim="subtitle">
          {subtitleShort ? (
            <>
              <span className="only-desktop">{subtitle}</span>
              <span className="only-mobile">{subtitleShort}</span>
            </>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
    </div>
  )
}
