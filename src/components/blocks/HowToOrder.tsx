/*
 * 5. Как заказать — structure.md §2, content.md «5. Как заказать».
 * Два сценария по ответам 16–17: шаги 01–02 общие, 03 «деталь на складе» и 04 «везём из-за рубежа» — развилка.
 * Десктоп: левая колонка sticky, карточки — sticky-стопка. Уменьшение и затемнение предыдущей — motion/scenes/sections.ts (--dim).
 */
import type { Location } from '@/data/types'
import { LeadButton } from '../contact/LeadButton'
import { SectionTitle } from '../ui/SectionTitle'
import styles from './HowToOrder.module.css'

type Props = { pickup: Location | null }

export function HowToOrder({ pickup }: Props) {
  // Шаг 03 — правка клиента 2026-09-18: самовывоз со склада или доставка в любую точку России.
  // Оплата через Авито Доставку ушла из карточки в FAQ 4 и 5 — лимит текста шага 160 символов.
  const pickupText = pickup
    ? `Заберите на нашем складе ${pickup.city_prepositional ?? 'в пункте выдачи'} — оплата на месте. Или отправим доставкой в любую точку России в течение 2 дней после оплаты.`
    : 'Отправим доставкой в любую точку России в течение 2 дней после оплаты.'

  const steps: { branch?: string; title: string; text: string }[] = [
    { title: 'Пишете нам', text: 'VIN и название детали. С сайта сообщение уже будет набрано — останется дописать и отправить.' },
    { title: 'Подбор по VIN', text: 'Проверяем, подойдёт ли деталь к вашей машине, и называем цену до оплаты.' },
    { branch: 'если деталь есть', title: 'Деталь на складе', text: pickupText },
    {
      branch: 'если детали нет',
      title: 'Везём из-за рубежа',
      text: 'Из Дубая, Англии или США — 45–90 дней. Предоплата 60% после подбора.',
    },
  ]

  const cta = (
    <LeadButton lead={{ source: 'Как заказать' }} size="lg" icon="telegram">
      Связаться с нами
    </LeadButton>
  )

  return (
    <section id="how" className="section" aria-labelledby="how-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <SectionTitle
            id="how-title"
            title="Как заказать"
            subtitle="Без корзины и форм: всё решается в переписке с нами."
            subtitleShort="Всё — в переписке с нами."
          />
          <div className="only-desktop">{cta}</div>
        </div>
        <div className={styles.flow}>
          <ol className={styles.steps} data-anim="stack">
            {steps.map((s, i) => (
              <li key={s.title} className={styles.step} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.stepHead}>
                  <span className={styles.number} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.branch ? <span className={`t-eyebrow ${styles.branch}`}>{s.branch}</span> : null}
                </span>
                <h3 className={`t-h3 ${styles.stepTitle}`}>{s.title}</h3>
                <p className={`t-body ${styles.stepText}`}>{s.text}</p>
              </li>
            ))}
          </ol>
          {/* Условия доставки — пост клиента «Бонус» 2026-09-18: только малогабаритные, до ПВЗ Яндекс Маркета */}
          <p className={`t-small ${styles.note}`}>
            <span className="only-desktop">
              Доставка по России — СДЭК, Яндекс Доставка, ПЭК и другие ТК. Небольшие детали до ПВЗ Яндекс Маркета — за наш счёт: от 3 000 ₽ — до 300 ₽, от 10 000 ₽ — до 500 ₽. Поставить деталь можно в Gal service.
            </span>
            <span className="only-mobile">СДЭК, Яндекс, ПЭК и другие. Небольшие детали от 3 000 ₽ — до ПВЗ Яндекс Маркета бесплатно.</span>
          </p>
        </div>
        <div className="only-mobile">{cta}</div>
      </div>
    </section>
  )
}
