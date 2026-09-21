/*
 * 1. Первый экран — structure.md §2, content.md «1. Первый экран» (утверждено).
 * Фото: десктоп — hero-bmw-e34 (16:9), телефон — hero-bmw-e34-mobile (4:5), art direction через <picture>.
 * Анимация — src/components/motion/scenes/hero.ts: интро после прелоадера (data-intro прячет до старта), параллакс при скролле.
 */
import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { files } from '@/data/seed/files'
import { LeadButton } from '../contact/LeadButton'
import { Button } from '../ui/Button'
import styles from './Hero.module.css'

const ALT = 'Чёрная BMW в мастерской, оранжевый свет'

export function Hero() {
  const common = { alt: ALT, priority: true, fill: true, quality: 75 } as const
  const { props: desktop } = getImageProps({ ...common, src: files.heroDesktop.src, sizes: '100vw' })
  const { props: mobile } = getImageProps({ ...common, src: files.heroMobile.src, sizes: '100vw' })
  // <picture> не получает preload от next/image — кладём оба варианта с media, грузится один
  preload(mobile.src, { as: 'image', imageSrcSet: mobile.srcSet, imageSizes: mobile.sizes, fetchPriority: 'high', media: '(max-width: 767.98px)' })
  preload(desktop.src, { as: 'image', imageSrcSet: desktop.srcSet, imageSizes: desktop.sizes, fetchPriority: 'high', media: '(min-width: 768px)' })

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} data-anim="reveal" data-intro>
        <picture data-anim="parallax">
          <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
          <source srcSet={mobile.srcSet} sizes={mobile.sizes} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...mobile} className={styles.img} />
        </picture>
        <span className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={`container ${styles.content}`} data-anim="content">
        <h1 id="hero-title" className={styles.title}>
          <span className={`t-eyebrow ${styles.eyebrow}`} data-intro data-anim="eyebrow">
            <span className="only-desktop">Запчасти для BMW в наличии и под заказ</span>
            <span className="only-mobile">Запчасти BMW · в наличии и под заказ</span>
          </span>
          <span className={`t-display t-h1 ${styles.display}`} data-anim="split" data-intro>
            <span className="only-desktop">
              <span className={styles.line}>Больше, чем</span>
              <span className={styles.line}>просто запчасти</span>
              <span className={`${styles.line} ${styles.accent}`}>это GAL</span>
            </span>
            <span className="only-mobile">
              <span className={styles.line}>Больше, чем запчасти.</span>
              <span className={`${styles.line} ${styles.accent}`}>Это GAL</span>
            </span>
          </span>
        </h1>

        <p className={`t-body ${styles.lead}`} data-intro data-anim="fade">
          <span className="only-desktop">
            Б/у оригинал со своего разбора и под заказ из Дубая, Англии и США. Подберём деталь по VIN и назовём цену ещё в
            переписке, до оплаты. Установка — в Gal service, салон — в Gal custom.
          </span>
          <span className="only-mobile">Б/у оригинал в наличии и под заказ. Подбор по&nbsp;VIN.</span>
        </p>

        <div className={styles.actions} data-intro data-anim="actions">
          <LeadButton lead={{ source: 'первый экран' }} size="lg" icon="telegram">
            Связаться с нами
          </LeadButton>
          <Button href="#parts" variant="secondary" size="lg" icon="arrowRight" className={styles.secondary}>
            <span className="only-desktop">Смотреть разделы</span>
            <span className="only-mobile">Разделы</span>
          </Button>
        </div>
        <p className={`t-small ${styles.hint}`} data-intro data-anim="fade">
          <span className="only-desktop">VIN и название детали — и ответим по делу</span>
          <span className="only-mobile">VIN и название детали — ответ по делу</span>
        </p>
        {/* внутри контента: с планшета надпись стоит над заголовком, а не у верха окна — в низком окне она наезжала на H1 */}
        <p className={`t-script ${styles.script}`} aria-hidden="true" data-intro data-anim="script">
          Движимы страстью
        </p>
      </div>

      <p className={`t-eyebrow ${styles.tagline}`} data-intro data-anim="tagline">PARTS · SERVICE · CUSTOM</p>
    </section>
  )
}
