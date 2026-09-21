'use client'

/*
 * Содержимое раздела — одно на попап и на /parts/[slug]. structure.md §3, content.md «4a».
 * Порядок: кузов не выбран — по sort; выбран — подходящие, разделитель «Для других кузовов», остальные.
 * Кузов берётся из блока «Какая у вас BMW?» — строка над сеткой говорит об этом и даёт сбросить выбор
 * (переключатель «Все / Для E34» убран 2026-09-16: без объяснения было непонятно, откуда взялся кузов).
 * Карточка кликабельна целиком — это та же кнопка «Узнать цену», при наведении она загорается.
 * «Нет нужной? Найдём или привезём» — последняя карточка первой сетки (для выбранного кузова — сразу после подходящих):
 * так она закрывает пустую ячейку ряда, а не прячется в самом конце после чужих кузовов.
 * На телефоне и планшете — полоса на всю ширину сетки под карточками: в ячейке 160–240px текст сжимался в пару слов,
 * а кнопка ломалась на три строки.
 */
import { useId } from 'react'
import type { PartPosition, PartSection } from '@/data/types'
import { formatBodiesLine, formatPrice } from '@/lib/format'
import { Icon, SECTION_ICONS } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import { LeadButton } from '../contact/LeadButton'
import { useContact } from '../contact/ContactProvider'
import styles from './SectionView.module.css'

type Props = {
  section: PartSection
  positions: PartPosition[]
  /** заголовок h1 на странице, h2 в попапе */
  headingLevel: 'h1' | 'h2'
  titleId?: string
}

export function SectionView({ section, positions, headingLevel: Heading, titleId }: Props) {
  const { body, setBody } = useContact()
  const uid = useId()
  const code = body?.kind === 'body' ? body.code : null

  const matching = code ? positions.filter((p) => p.bodies.includes(code)) : positions
  const others = code ? positions.filter((p) => !p.bodies.includes(code)) : []

  const card = (p: PartPosition) => {
    const fits = code !== null && p.bodies.includes(code)
    const line = formatBodiesLine(p.bodies, p.spec_note)
    const price = formatPrice(p.price_from)
    return (
      <li key={p.id} className={styles.card} data-fits={fits || undefined}>
        <div className={styles.media}>
          {p.photo ? (
            <Photo
              file={p.photo}
              alt={`${p.name} для BMW ${p.bodies.join(', ')}`}
              ratio="1 / 1"
              sizes="(min-width: 992px) 240px, 50vw"
            />
          ) : (
            <span className={styles.placeholder}>
              <Icon name={SECTION_ICONS[section.icon]} className={styles.placeholderIcon} />
            </span>
          )}
          {fits ? (
            <span className={`t-eyebrow ${styles.fits}`}>
              <span className="only-desktop">Подходит к {code}</span>
              <span className="only-mobile">{code} ✓</span>
            </span>
          ) : null}
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.name}>{p.name}</h3>
          {line.short ? (
            <p className={`t-small ${styles.bodies}`} title={line.full} aria-label={`Кузова: ${line.full}`}>
              {line.short}
            </p>
          ) : null}
          <p className={price ? styles.price : `${styles.price} ${styles.priceOnRequest}`}>{price ?? 'цена по запросу'}</p>
          <LeadButton
            lead={{ topic: 'parts', section: section.name, position: p.name, source: 'карточка позиции' }}
            variant="secondary"
            block
            icon="telegram"
            className={styles.cardButton}
          >
            {/* «на мою BMW» не влезало в карточку 240px и ломалось на две строки */}
            Узнать цену
          </LeadButton>
        </div>
      </li>
    )
  }

  const lastCard = (
    <li className={`${styles.card} ${styles.last}`}>
      <div className={styles.lastBody}>
        <div className={styles.lastText}>
          <p className={styles.lastTitle}>Нет нужной? Найдём или привезём</p>
          <p className="t-small">
            Напишите VIN и какая деталь нужна. Проверим склад или скажем, сколько её везти и сколько это будет стоить.
          </p>
        </div>
        <LeadButton
          lead={{ topic: 'parts', section: section.name, source: 'карточка «Нет нужной?»' }}
          icon="telegram"
          className={styles.lastButton}
        >
          Спросить про деталь
        </LeadButton>
      </div>
    </li>
  )

  return (
    <div className={styles.root}>
      <header className={styles.head}>
        <Heading id={titleId} className={`t-display t-h2 ${styles.title}`}>
          {section.name}
        </Heading>
        <p className={`t-body ${styles.description}`}>
          <span className="only-desktop">{section.description}</span>
          <span className="only-mobile">{section.description_short ?? section.description}</span>
        </p>
      </header>

      {positions.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name={SECTION_ICONS[section.icon]} />
          </span>
          <p className={styles.lastTitle}>Детали этого раздела — по запросу</p>
          <p className="t-small">Напишите VIN и что нужно — проверим склад и назовём цену.</p>
          <LeadButton lead={{ topic: 'parts', section: section.name, source: 'пустой раздел' }} icon="telegram" size="lg">
            Спросить про деталь
          </LeadButton>
        </div>
      ) : (
        <>
          {code ? (
            <p className={`t-small ${styles.bodyNote}`}>
              <span>
                <span className="only-desktop">
                  Сверху — детали для вашей BMW {code}: кузов выбран в блоке «Какая у вас BMW?».
                </span>
                <span className="only-mobile">Сверху — детали для {code}.</span>
              </span>
              <button type="button" className={styles.bodyReset} onClick={() => setBody(null)}>
                Показать все по порядку
              </button>
            </p>
          ) : null}

          {code && matching.length === 0 ? (
            <p className={`t-small ${styles.notice}`}>
              Для {code} здесь пока ничего нет — это не значит, что детали нет. Свяжитесь с нами.
            </p>
          ) : null}

          <ul className={styles.grid} aria-labelledby={titleId} data-anim="stagger">
            {matching.map(card)}
            {lastCard}
          </ul>

          {code && others.length > 0 ? (
            <>
              <p className={`t-eyebrow ${styles.divider}`} id={`${uid}-others`}>
                Для других кузовов
              </p>
              <ul className={styles.grid} aria-labelledby={`${uid}-others`}>
                {others.map(card)}
              </ul>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
