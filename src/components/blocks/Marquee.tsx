/*
 * Бегущая строка между разделами и «Как заказать» — декор, как ленты scrib3:
 * две ленты крест-накрест, оранжевая и тёмная, едут навстречу; скролл ускоряет и разворачивает их.
 * Без анимации — неподвижная полоса. Для скринридера скрыта: смысл дублирует текст блоков.
 */
import styles from './Marquee.module.css'

type Props = { bodies: string[] }

export function Marquee({ bodies }: Props) {
  const front = ['Б/у оригинал', ...bodies.map((code) => `BMW ${code}`), 'Проверено перед продажей']
  const back = ['Parts', 'Service', 'Custom', 'Дубай', 'Англия', 'США', 'Движимы страстью']

  const list = (items: string[], copy: number) => (
    <ul className={styles.list} key={copy}>
      {items.map((text) => (
        <li key={text} className={styles.item}>
          <span>{text}</span>
          <span className={styles.sep} />
        </li>
      ))}
    </ul>
  )

  return (
    <div className={styles.root} aria-hidden="true" data-anim="marquee">
      <div className={`${styles.band} ${styles.back}`} data-band="-1">
        <div className={styles.track} data-track>
          {[0, 1, 2, 3].map((i) => list(back, i))}
        </div>
      </div>
      <div className={`${styles.band} ${styles.front}`} data-band="1">
        <div className={styles.track} data-track>
          {[0, 1].map((i) => list(front, i))}
        </div>
      </div>
    </div>
  )
}
