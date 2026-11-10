'use client'

/*
 * Варианты блока-входа в прайс /service для главной — смотрим на /lab/price-block, выбираем один.
 * Все на живых данных: услуги и цены из прайса, кузов — общий выбор сайта (ContactProvider).
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { Service } from '@/data/types'
import { formatPrice, plural } from '@/lib/format'
import { SERVICE_CATEGORIES, formatServicePrice, priceFor } from '@/lib/services'
import { files } from '@/data/seed/files'
import { useContact } from '../contact/ContactProvider'
import { Icon } from '../icons/Icon'
import { Photo } from '../ui/Photo'
import { SectionTitle } from '../ui/SectionTitle'
import styles from './PriceTeasers.module.css'

type Props = { services: Service[] }

const POPULAR = ['Замена передних колодок', 'Замена моторного масла', 'Замена комплекта ГРМ', 'Замена сцепления', 'Замена переднего амортизатора', 'Замена помпы']
const QUICK = ['Колодки', 'ГРМ', 'Сцепление', 'Амортизаторы', 'Помпа', 'Кондиционер']

/* подпись работы в именительном падеже: в прайсе «Замена передних колодок» → «Передние колодки» */
const LABELS: Record<string, string> = {
  'Замена передних колодок': 'Передние колодки',
  'Замена моторного масла': 'Моторное масло',
  'Замена комплекта ГРМ': 'Комплект ГРМ',
  'Замена сцепления': 'Сцепление',
  'Замена переднего амортизатора': 'Передний амортизатор',
  'Замена помпы': 'Помпа',
}
const short = (name: string) => LABELS[name] ?? name
const priceHref = (params: Record<string, string | null | undefined>) => {
  const q = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])))
  const s = q.toString()
  return s ? `/service?${s}` : '/service'
}

function useBody() {
  const { bodies, body, setBody } = useContact()
  const code = body?.kind === 'body' ? body.code : null
  return { bodies, code, setBody }
}

/* ── A. Цена для вашей BMW: кузов в один тап → живые цены ходовых работ ── */
export function TeaserCalc({ services }: Props) {
  const { bodies, code, setBody } = useBody()
  const popular = POPULAR.map((n) => services.find((s) => s.name === n)).filter((s): s is Service => Boolean(s))

  return (
    <section className={`section ${styles.calc}`} aria-labelledby="t-calc">
      <div className={`container ${styles.calcInner}`}>
        <div className={styles.calcHead}>
          <SectionTitle id="t-calc" eyebrow="Gal service · прайс" title="Сколько стоит ремонт вашей BMW" titleShort="Цена ремонта" />
          <p className={`t-body ${styles.muted}`}>Выберите кузов — покажем цены за работу именно для него. Мотор уточните в прайсе, и цена станет точной.</p>
          <div className={styles.codes} role="group" aria-label="Кузов">
            {bodies.map((b) => (
              <button key={b.code} type="button" className={styles.code} aria-pressed={code === b.code} onClick={() => setBody(code === b.code ? null : { kind: 'body', code: b.code })}>
                {b.code}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.calcCard}>
          <p className={styles.calcCardHead}>
            <span>{code ? `BMW ${code}` : 'Все кузова'}</span>
            <span className={styles.muted}>работа, без детали</span>
          </p>
          <ul className={styles.calcList}>
            {popular.map((s) => (
              <li key={s.id}>
                <span>{short(s.name)}</span>
                <span className={styles.calcPrice}>{formatServicePrice(priceFor(s, code))}</span>
              </li>
            ))}
          </ul>
          <Link href={priceHref({ body: code })} className={styles.cta}>
            {code ? `Весь прайс для ${code}` : 'Весь прайс'} — {services.length} {plural(services.length, 'работа', 'работы', 'работ')}
            <Icon name="arrowRight" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── B. Поиск-вход: одно поле и частые запросы ── */
export function TeaserSearch({ services }: Props) {
  const router = useRouter()
  const [q, setQ] = useState('')
  const go = (query: string) => router.push(priceHref({ q: query.trim() }))

  return (
    <section className={`section ${styles.search}`} aria-labelledby="t-search">
      <div className={`container ${styles.searchInner}`}>
        <SectionTitle id="t-search" title="Что сделать с вашей BMW?" titleShort="Что сделать?" subtitle={`Найдите работу в прайсе — ${services.length} позиций с ценой для вашего кузова и мотора`} subtitleShort="Цена работы за пару секунд" />
        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
        >
          <label className={styles.searchField}>
            <Icon name="search" className={styles.searchIcon} />
            <span className="sr-only">Поиск по прайсу ремонта</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Колодки, ГРМ, помпа…" enterKeyHint="search" />
          </label>
          <button type="submit" className={styles.searchBtn}>
            Найти цену
            <Icon name="arrowRight" />
          </button>
        </form>
        <ul className={styles.quick}>
          {QUICK.map((w) => (
            <li key={w}>
              <Link href={priceHref({ q: w })} className={styles.quickChip}>
                {w}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/service" className={styles.quickAll}>
              Весь прайс <Icon name="arrowRight" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ── C. Группы работ плитками: каталог с «от» по группе ── */
export function TeaserGroups({ services }: Props) {
  const { code } = useBody()
  const groups = useMemo(
    () =>
      SERVICE_CATEGORIES.map((c) => {
        const items = services.filter((s) => s.category === c.value)
        const lows = items.map((s) => {
          const p = priceFor(s, code)
          return !p || p.kind === 'ask' ? null : p.kind === 'range' ? p.min : p.value
        })
        const nums = lows.filter((n): n is number => Boolean(n))
        return { ...c, count: items.length, min: nums.length ? Math.min(...nums) : null }
      }).filter((g) => g.count > 0),
    [services, code],
  )

  return (
    <section className="section" aria-labelledby="t-groups">
      <div className={`container ${styles.groupsInner}`}>
        <div className={styles.groupsHead}>
          <SectionTitle id="t-groups" title="Ремонт по группам" subtitle={code ? `Цены для BMW ${code} — за работу, без детали` : 'Цены за работу — точная для вашего кузова и мотора в прайсе'} />
          <Link href={priceHref({ body: code })} className={styles.ghostLink}>
            Весь прайс <Icon name="arrowRight" />
          </Link>
        </div>
        <ul className={styles.groups}>
          {groups.map((g) => (
            <li key={g.value}>
              <Link href={priceHref({ body: code, group: g.value })} className={styles.groupTile}>
                <Icon name={g.icon} className={styles.groupIcon} />
                <span className={styles.groupName}>{g.label}</span>
                <span className={styles.groupMeta}>
                  {g.count} {plural(g.count, 'работа', 'работы', 'работ')}
                  {g.min ? <b> · {formatPrice(g.min)}</b> : null}
                </span>
                <Icon name="arrowRight" className={styles.groupArrow} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── D. Баннер: фото мастерской, три факта и кнопка ── */
export function TeaserBanner({ services }: Props) {
  const { bodies, code } = useBody()
  return (
    <section className="section" aria-labelledby="t-banner">
      <div className="container">
        <div className={styles.banner}>
          <Photo file={files.serviceWorkshop} alt="" ratio="auto" sizes="(min-width: 1240px) 1200px, 100vw" className={styles.bannerPhoto} />
          <div className={styles.bannerBody}>
            <p className={`t-eyebrow ${styles.accent}`}>Gal service</p>
            <h2 id="t-banner" className={`t-display t-h2 ${styles.bannerTitle}`}>
              Прайс на ремонт — без звонков
            </h2>
            <dl className={styles.facts}>
              <div>
                <dt>{services.length}</dt>
                <dd>работ с ценой</dd>
              </div>
              <div>
                <dt>{bodies.length}</dt>
                <dd>кузовов — у каждого свой прайс</dd>
              </div>
              <div>
                <dt>2 нед.</dt>
                <dd>гарантия на нашу деталь</dd>
              </div>
            </dl>
            <Link href={priceHref({ body: code })} className={styles.bannerBtn}>
              {code ? `Открыть прайс для ${code}` : 'Открыть прайс'}
              <Icon name="arrowRight" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── E. Одна работа на всех кузовах: видно, зачем выбирать свой ── */
const COMPARE = ['Замена сцепления', 'Замена комплекта ГРМ', 'Замена переднего амортизатора']

export function TeaserCompare({ services }: Props) {
  const { bodies, code } = useBody()
  const [work, setWork] = useState(COMPARE[0])
  const s = services.find((x) => x.name === work)
  const rows = bodies
    .map((b) => {
      const ps = s?.prices.filter((p) => p.body === b.code).map((p) => p.price) ?? []
      return ps.length ? { code: b.code, min: Math.min(...ps), max: Math.max(...ps) } : null
    })
    .filter((r): r is { code: string; min: number; max: number } => Boolean(r))
  const top = Math.max(...rows.map((r) => r.max), 1)

  return (
    <section className="section" aria-labelledby="t-compare">
      <div className={`container ${styles.compareInner}`}>
        <div className={styles.compareHead}>
          <SectionTitle id="t-compare" title="Одна работа — разная цена" subtitle="У каждого кузова и мотора своя цена. Посмотрите свою — не среднюю по рынку." />
          <div className={styles.tabs} role="tablist" aria-label="Работа">
            {COMPARE.map((w) => (
              <button key={w} type="button" role="tab" aria-selected={work === w} className={styles.tab} onClick={() => setWork(w)}>
                {short(w)}
              </button>
            ))}
          </div>
        </div>
        <ul className={styles.bars}>
          {rows.map((r) => (
            <li key={r.code} data-mine={r.code === code || undefined}>
              <span className={styles.barCode}>{r.code}</span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ left: `${(r.min / top) * 100}%`, width: `${Math.max(((r.max - r.min) / top) * 100, 1.5)}%` }} />
              </span>
              <span className={styles.barPrice}>{formatServicePrice(r.min === r.max ? { kind: 'exact', value: r.min } : { kind: 'range', min: r.min, max: r.max })}</span>
            </li>
          ))}
        </ul>
        <Link href={priceHref({ body: code, q: short(work) })} className={styles.cta}>
          Точная цена для вашей BMW <Icon name="arrowRight" />
        </Link>
      </div>
    </section>
  )
}
