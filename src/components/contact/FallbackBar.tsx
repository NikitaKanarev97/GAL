'use client'

/* Нижняя плашка после кнопки с известной темой — Telegram открыт без попапа */
import { Button } from '../ui/Button'
import { TelegramFallback } from './TelegramFallback'
import styles from './FallbackBar.module.css'

export function FallbackBar({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div className={styles.bar} role="region" aria-label="Telegram не открылся?" aria-live="polite" data-anim="toast">
      <div className={styles.inner}>
        <TelegramFallback message={message} />
        <Button variant="ghost" onClick={onDone} className={styles.done}>
          Готово
        </Button>
      </div>
    </div>
  )
}
