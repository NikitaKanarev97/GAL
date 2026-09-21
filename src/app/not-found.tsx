/* 404 — content.md «Микротексты → 404» */
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { LeadButton } from '@/components/contact/LeadButton'
import styles from './doc.module.css'

export const metadata: Metadata = { title: 'Страница не найдена — GAL' }

export default async function NotFound() {
  return (
    <div className={`container ${styles.doc}`}>
      <h1 className={`t-display t-h1 ${styles.titleLg}`}>Такой страницы нет</h1>
      <p className="t-body">
        <span className="only-desktop">
          Возможно, раздел переименовали или ссылка с ошибкой. Деталь всё равно можно заказать — свяжитесь с нами.
        </span>
        <span className="only-mobile">Ссылка с ошибкой. Деталь всё равно можно заказать.</span>
      </p>
      <div className={styles.actions}>
        <Button href="/" variant="secondary" icon="arrowLeft" iconPosition="start">
          На главную
        </Button>
        <LeadButton lead={{ source: '404' }} icon="telegram">
          Связаться с нами
        </LeadButton>
      </div>
    </div>
  )
}
