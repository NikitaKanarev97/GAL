/* Сравнение вариантов блока-входа в прайс для главной. Служебная страница: не в навигации, не индексируется. */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { getServices } from '@/data'
import { TeaserBanner, TeaserCalc, TeaserCompare, TeaserGroups, TeaserSearch } from '@/components/lab/PriceTeasers'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Варианты блока «Прайс» — GAL',
  robots: { index: false, follow: false },
}

type Variant = { id: string; title: string; where: string; plus: string[]; minus: string[]; node: ReactNode; pick?: boolean }

export default async function PriceBlockLab() {
  const services = await getServices()
  const variants: Variant[] = [
    {
      id: 'A',
      title: 'Цена для вашей BMW',
      where: 'Вместо списка «Что делаем» в Gal service или отдельным блоком сразу после него',
      plus: ['Сразу показывает главное отличие — цена под свой кузов, а не «от»', 'Тот же выбор кузова, что и на сайте: выбрал здесь — прайс уже настроен', 'Ведёт в прайс с выбранным кузовом'],
      minus: ['Самый сложный из пяти: две колонки и интерактив', 'Мотор здесь не выбрать — вилка до перехода в прайс'],
      node: <TeaserCalc services={services} />,
      pick: true,
    },
    {
      id: 'B',
      title: 'Поиск-вход',
      where: 'Отдельным блоком после «Почему GAL» или перед FAQ',
      plus: ['Ближе всего к тому, как ищут: «колодки», «ГРМ»', 'Минимум места, понятен с первого взгляда', 'Запрос сразу открывается в прайсе'],
      minus: ['Не показывает цен — их надо открыть', 'Не видно, что цена зависит от кузова'],
      node: <TeaserSearch services={services} />,
    },
    {
      id: 'C',
      title: 'Группы работ',
      where: 'Внутри Gal service под фото мастерской вместо списка из 8 строк',
      plus: ['Сразу видно, что мы делаем всё — от ТО до кузова', 'Каждая плитка ведёт в свою группу прайса', 'Хорошо для поиска Яндекса: 12 ссылок на группы'],
      minus: ['Похоже на плитки «Запчасти» выше по странице', 'Длинный блок на телефоне (6 рядов)'],
      node: <TeaserGroups services={services} />,
    },
    {
      id: 'D',
      title: 'Баннер',
      where: 'Между Gal service и Gal custom — как разделитель с призывом',
      plus: ['Самый заметный, работает как реклама', 'Простой: заголовок, три факта, кнопка'],
      minus: ['Ничего не даёт сделать на месте', 'Ещё один тёмный баннер с фото — на главной уже есть Custom'],
      node: <TeaserBanner services={services} />,
    },
    {
      id: 'E',
      title: 'Одна работа на всех кузовах',
      where: 'Отдельным блоком перед FAQ — как довод, зачем выбирать кузов',
      plus: ['Наглядно объясняет, почему цена разная', 'Выбранный кузов подсвечен', 'Цепляет любопытство: «а сколько у меня?»'],
      minus: ['Требует пару секунд, чтобы понять график', 'Узкий сценарий: три работы'],
      node: <TeaserCompare services={services} />,
    },
  ]

  return (
    <div className={styles.page}>
      <header className={`container ${styles.head}`}>
        <p className="t-eyebrow">Служебная страница · не в навигации</p>
        <h1 className="t-display t-h2">Блок «Прайс» на главной — 5 вариантов</h1>
        <p className={`t-body ${styles.lead}`}>
          Каждый ведёт на страницу прайса со своего входа: кузов, поиск, группа, баннер или сравнение. Всё живое — цены из прайса,
          выбор кузова общий с сайтом. Выберите кузов в любом варианте, и остальные подстроятся.
        </p>
        <nav className={styles.toc} aria-label="Варианты">
          {variants.map((v) => (
            <a key={v.id} href={`#v-${v.id}`} className={styles.tocLink}>
              <b>{v.id}</b> {v.title}
              {v.pick ? <span className={styles.pickBadge}>советую</span> : null}
            </a>
          ))}
        </nav>
      </header>

      {variants.map((v) => (
        <article key={v.id} id={`v-${v.id}`} className={styles.variant}>
          <div className={`container ${styles.meta}`}>
            <p className={styles.label}>
              <span className={styles.letter}>{v.id}</span>
              {v.title}
              {v.pick ? <span className={styles.pickBadge}>советую</span> : null}
            </p>
            <p className={`t-small ${styles.where}`}>Где: {v.where}</p>
            <div className={styles.pm}>
              <ul>
                {v.plus.map((t) => (
                  <li key={t} className={styles.plus}>
                    {t}
                  </li>
                ))}
              </ul>
              <ul>
                {v.minus.map((t) => (
                  <li key={t} className={styles.minus}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.stage}>{v.node}</div>
        </article>
      ))}
    </div>
  )
}
