/*
 * 4. Разделы запчастей — structure.md §2, content.md «4. Разделы запчастей».
 * Плитка → /parts/[slug]: с главной — попап (intercepting route), прямой заход — страница.
 * Пустые состояния — content-model.md §1: 0 позиций → «под заказ»; нет обложки → иконка; 0 разделов → только плашка.
 */
import Link from 'next/link'
import type { SectionWithCount } from '@/data'
import type { SiteSettings } from '@/data/types'
import { files } from '@/data/seed/files'
import { plural } from '@/lib/format'
import { Icon, SECTION_ICONS } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import { SectionTitle } from '../ui/SectionTitle'
import { LeadButton } from '../contact/LeadButton'
import styles from './Parts.module.css'

type Props = { sections: SectionWithCount[]; settings: SiteSettings }

export function Parts({ sections, settings }: Props) {
  const value = settings.parts_counter_value
  const digits = value ? String(value).split('') : []

  return (
    <section id="parts" className="section" aria-labelledby="parts-title">
      <div className={`container ${styles.inner}`}>
        <SectionTitle
          id="parts-title"
          title="Запчасти BMW"
          subtitle="В разделах — детали, которые спрашивают чаще всего, с ценой от. Всё остальное найдём на складе или привезём под заказ."
          subtitleShort="Ходовые детали с ценой от. Остальное — со склада или под заказ."
        />

        {sections.length > 0 ? (
          <ul className={styles.grid} data-anim="stagger">
            {sections.map((s) => {
              const n = s.positionsCount
              const aria =
                n > 0
                  ? `${s.name}: ${n} ${plural(n, 'деталь', 'детали', 'деталей')} с ценой, остальное под заказ`
                  : `${s.name}: все детали под заказ`
              return (
                <li key={s.id}>
                  <Link href={`/parts/${s.slug}`} scroll={false} id={`tile-${s.slug}`} className={styles.tile}>
                    {s.cover ? (
                      <Photo
                        file={s.cover}
                        alt=""
                        ratio="1 / 1"
                        sizes="(min-width: 1240px) 295px, (min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw"
                        className={styles.photo}
                        imgClassName={styles.img}
                      />
                    ) : (
                      <span className={styles.placeholder} data-anim="frame">
                        <Icon name={SECTION_ICONS[s.icon]} className={styles.placeholderIcon} />
                      </span>
                    )}
                    <span className={styles.caption}>
                      <span className={styles.name}>
                        {s.name}
                        {n > 0 ? (
                          <>
                            <sup className={styles.count} aria-hidden="true">
                              {n}
                            </sup>
                            <span className="sr-only">{aria.slice(s.name.length)}</span>
                          </>
                        ) : null}
                      </span>
                      {n === 0 ? (
                        <span className={`t-small ${styles.onOrder}`}>
                          <span className="sr-only">: все детали </span>под заказ
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}

        {/* Плашка «5000+» — на всю ширину после плиток */}
        <div className={styles.counter} data-anim="plate">
          <Photo file={files.counterBg} alt="" sizes="(min-width: 1240px) 1240px, 100vw" className={styles.counterBg} />
          <span className={styles.counterScrim} aria-hidden="true" />
          <div className={styles.counterBody} data-anim="plate-body">
            {value ? (
              <p className={styles.number}>
                <span className="sr-only">
                  {value}
                  {settings.parts_counter_suffix} {settings.parts_counter_label ?? 'деталей в наличии и под заказ'}
                </span>
                <span className={styles.odometer} aria-hidden="true" data-anim="odometer">
                  {digits.map((d, i) => (
                    <span key={i} className={`t-counter ${styles.cell}`}>
                      <span className={styles.digit} data-digit={d}>
                        {d}
                      </span>
                    </span>
                  ))}
                  {settings.parts_counter_suffix ? (
                    <span className={`t-counter ${styles.suffix}`} data-anim="odometer-suffix">{settings.parts_counter_suffix}</span>
                  ) : null}
                </span>
                <span className={`t-eyebrow ${styles.counterLabel}`} aria-hidden="true">
                  {settings.parts_counter_label ?? 'деталей в наличии и под заказ'}
                </span>
              </p>
            ) : (
              <p className={`t-display t-h2 ${styles.noNumber}`}>Любая деталь — в наличии или под заказ</p>
            )}
            <p className={`t-body ${styles.counterText}`}>
              <span className="only-desktop">Нет в разделах — напишите VIN и какая деталь нужна. Найдём на складе или привезём.</span>
              <span className="only-mobile">Нет в разделах — напишите, найдём.</span>
            </p>
            {/* обёртка: появление двигает её, а не кнопку — CSS-переход нажатия у кнопки сбивал GSAP, и она оставалась ниже на 30px */}
            <div>
              <LeadButton lead={{ topic: 'parts', source: 'плашка 5000+' }} size="lg" icon="telegram">
                Спросить про деталь
              </LeadButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
