/*
 * 8. Gal custom — structure.md §2, content.md «8. Gal custom».
 * Лента работ: от 3 — горизонтальная лента (десктоп: пин и езда — motion/scenes/sections.ts, без JS — прокрутка со снапом),
 * 1–2 — обычная сетка, 0 — баннер и кнопка. Телефон — вертикальный поток.
 */
import { getImageProps } from 'next/image'
import type { WorkView } from '@/data'
import type { SiteSettings } from '@/data/types'
import { files } from '@/data/seed/files'
import { LeadButton } from '../contact/LeadButton'
import { HexBadge } from '../icons/HexBadge'
import { Icon } from '../icons/Icon'
import { WorkCard } from './WorkCard'
import styles from './Custom.module.css'

type Props = { works: WorkView[]; settings: SiteSettings }

const ALT = 'Кожа салона с оранжевой строчкой'

export function Custom({ works, settings }: Props) {
  const banner = settings.custom_banner ?? files.customBanner
  const bannerMobile = settings.custom_banner ?? files.customBannerMobile
  const { props: desktop } = getImageProps({ src: banner.src, alt: ALT, fill: true, sizes: '(min-width: 1240px) 1240px, 100vw' })
  const { props: mobile } = getImageProps({ src: bannerMobile.src, alt: ALT, fill: true, sizes: '100vw' })
  const ribbon = works.length >= 3
  const instagram = settings.socials.find((s) => s.show_in_custom)

  return (
    <section id="custom" className={`section ${styles.root}`} aria-labelledby="custom-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.banner} data-anim="banner">
          <div className={styles.bannerMedia} data-anim="frame">
            <picture>
              <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
              <source srcSet={mobile.srcSet} sizes={mobile.sizes} />
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img {...mobile} loading="lazy" className={styles.bannerImg} />
            </picture>
            <span className={styles.bannerScrim} aria-hidden="true" />
          </div>
          <div className={styles.bannerBody} data-anim="banner-body">
            <p className={`t-display ${styles.brand}`}>Gal custom</p>
            <h2 id="custom-title" className={`t-display t-h2 ${styles.title}`} data-anim="split">
              <span className="only-desktop">Перешив салонов, рулей, торпедо и потолков</span>
              <span className="only-mobile">Перешив салонов</span>
            </h2>
            <p className={`t-body ${styles.text}`}>
              <span className="only-desktop">Салон, в котором хочется сидеть, — на любой машине, не только BMW. Пришлите фото — скажем, что можно сделать.</span>
              <span className="only-mobile">Любые машины. Пришлите фото салона — скажем, что можно сделать.</span>
            </p>
            <p className={`t-small ${styles.prices}`}>
              Ещё — дверные карты, стойки, ручки и козырьки, ремонт сидений и поролона, цвет ремней безопасности.
            </p>
            <p className={`t-small ${styles.prices}`}>Руль — от 7 000 ₽ за 1–2 рабочих дня, салон целиком — от 120 000 ₽ примерно за 2 недели.</p>
            {instagram ? (
              <a className={styles.social} href={instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Работы — в Instagram @${instagram.handle} — откроется в новой вкладке`}>
                <Icon name="instagram" className={styles.socialIcon} />
                <span className="only-desktop">Работы — в Instagram @{instagram.handle}</span>
                <span className="only-mobile">@{instagram.handle}</span>
              </a>
            ) : null}
            <div className={styles.cta}>
              <LeadButton lead={{ topic: 'custom', source: 'Gal custom' }} size="lg" icon="telegram">
                Обсудить салон
              </LeadButton>
              <p className={`t-small ${styles.hint}`}>
                <span className="only-desktop">Фото салона и что хотите поменять</span>
                <span className="only-mobile">Фото + что поменять</span>
              </p>
            </div>
          </div>
          <div className={styles.tag}>
            {/* «Премиальные материалы» — из макета, подтверждено Ваней 2026-09-16 */}
            <p className={styles.material}>
              <HexBadge name="material" />
              <span className="t-small">Премиальные материалы</span>
            </p>
          </div>
        </div>

        {works.length > 0 ? (
          <div className={styles.works}>
            <h3 className={`t-eyebrow ${styles.subhead}`}>Работы и примеры</h3>
            <div className={ribbon ? styles.ribbonViewport : undefined} data-anim={ribbon ? 'pin' : undefined}>
              <ul className={ribbon ? styles.ribbon : styles.grid} data-anim={ribbon ? 'track' : undefined}>
                {works.map((w, i) => (
                  <li key={w.id} className={styles.slide}>
                    <WorkCard
                      work={w}
                      counter={ribbon ? `${i + 1} / ${works.length}` : undefined}
                      sizes="(min-width: 992px) 500px, (min-width: 768px) 50vw, 100vw"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
