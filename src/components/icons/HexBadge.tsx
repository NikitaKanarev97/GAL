/* Медальная версия иконки — шестигранник со срезанными углами и свечением (custom-wide.jpg). */
import { Icon, type IconName } from './Icon'
import styles from './HexBadge.module.css'

type Props = { name: IconName; size?: 'md' | 'lg'; className?: string }

export function HexBadge({ name, size = 'md', className }: Props) {
  return (
    <span className={[styles.badge, styles[size], className].filter(Boolean).join(' ')} aria-hidden="true">
      <svg className={styles.frame} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round">
        <path d="M27.5 4.6a9 9 0 0 1 9 0l18.8 10.8a9 9 0 0 1 4.5 7.8v17.6a9 9 0 0 1-4.5 7.8L36.5 59.4a9 9 0 0 1-9 0L8.7 48.6a9 9 0 0 1-4.5-7.8V23.2a9 9 0 0 1 4.5-7.8L27.5 4.6z" />
      </svg>
      <Icon name={name} className={styles.icon} />
    </span>
  )
}
