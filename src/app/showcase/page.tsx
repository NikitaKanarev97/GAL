/*
 * Витрина слоя стилей — smoke-тест скилла react-base: семантические цвета, шкала текста,
 * иконки (плейсхолдеры разделов и доводы), кнопки и состояния. Не индексируется.
 */
import type { Metadata } from 'next'
import { ALL_ICONS, Icon } from '@/components/icons/Icon'
import { HexBadge } from '@/components/icons/HexBadge'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/SectionTitle'
import styles from './page.module.css'

export const metadata: Metadata = { title: 'Витрина токенов — GAL', robots: { index: false } }

const COLORS = [
  'bg',
  'bg-elevated',
  'bg-elevated-2',
  'line',
  'line-strong',
  'line-warm',
  'accent',
  'accent-hover',
  'accent-ember',
  'text',
  'text-muted',
  'text-soft',
  'steel',
  'steel-light',
  'on-accent',
]

const TYPE = [
  ['t-display t-h1', 'H1 Unbounded 900'],
  ['t-display t-h2', 'H2 Unbounded 800'],
  ['t-display t-h3', 'H3 Unbounded 800'],
  ['t-body', 'Текст Manrope 400'],
  ['t-small', 'Мелкий Manrope 400'],
  ['t-eyebrow', 'Надзаголовок Manrope 500'],
  ['t-button', 'Кнопка Manrope 800'],
  ['t-script', 'Движимы страстью'],
  ['t-counter', '5000+'],
]

const SECTION = ['engine', 'transmission', 'suspension', 'lighting', 'body', 'electronics', 'interior', 'generic'] as const
const WHY = ['fit', 'tested', 'wrench', 'order', 'warranty', 'material'] as const

export default function Showcase() {
  return (
    <div className={`container ${styles.page}`}>
      <SectionTitle title="Витрина токенов" subtitle="visual-direction.md §3 и §8 → src/styles/tokens" as="h1" />

      <section className={styles.block}>
        <h2 className="t-eyebrow">Цвет — семантика</h2>
        <ul className={styles.swatches}>
          {COLORS.map((c) => (
            <li key={c} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(--${c})` }} />
              <code>--{c}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2 className="t-eyebrow">Типографика</h2>
        {TYPE.map(([cls, label]) => (
          <p key={cls} className={cls}>
            {label}
          </p>
        ))}
      </section>

      <section className={styles.block}>
        <h2 className="t-eyebrow">Иконки разделов — контур и медаль</h2>
        <ul className={styles.icons}>
          {SECTION.map((n) => (
            <li key={n} className={styles.iconCell}>
              <Icon name={n} className={styles.icon} />
              <HexBadge name={n} />
              <code>{n}</code>
            </li>
          ))}
        </ul>
        <h2 className="t-eyebrow">Почему GAL и плашки макета</h2>
        <ul className={styles.icons}>
          {WHY.map((n) => (
            <li key={n} className={styles.iconCell}>
              <Icon name={n} className={styles.icon} />
              <HexBadge name={n} size="lg" />
              <code>{n}</code>
            </li>
          ))}
        </ul>
        <h2 className="t-eyebrow">Интерфейс</h2>
        <ul className={styles.icons}>
          {ALL_ICONS.filter((n) => !(SECTION as readonly string[]).includes(n) && !(WHY as readonly string[]).includes(n)).map((n) => (
            <li key={n} className={styles.iconCell}>
              <Icon name={n} className={styles.icon} />
              <code>{n}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2 className="t-eyebrow">Кнопки</h2>
        <div className={styles.row}>
          <Button icon="telegram">Связаться с нами</Button>
          <Button variant="secondary" icon="arrowRight">
            Смотреть разделы
          </Button>
          <Button variant="ghost" icon="arrowLeft" iconPosition="start">
            Назад
          </Button>
          <Button disabled>Дальше</Button>
          <Button size="lg" icon="telegram">
            Открыть Telegram
          </Button>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className="t-eyebrow">Радиусы и тени</h2>
        <div className={styles.row}>
          {['radius-btn', 'radius-tile', 'radius-card', 'radius-pill'].map((r) => (
            <span key={r} className={styles.radius} style={{ borderRadius: `var(--${r})` }}>
              <code>--{r}</code>
            </span>
          ))}
          <span className={styles.radius} style={{ boxShadow: 'var(--shadow-float)' }}>
            <code>--shadow-float</code>
          </span>
          <span className={styles.radius} style={{ boxShadow: 'var(--glow-accent)' }}>
            <code>--glow-accent</code>
          </span>
        </div>
      </section>
    </div>
  )
}
