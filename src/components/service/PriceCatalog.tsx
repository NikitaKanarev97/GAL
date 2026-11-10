'use client'

/*
 * Прайс Gal service — страница /service.
 * Разводка: кузов → поиск → быстрые запросы → плитки групп (число услуг и «от» по группе) → группы секциями.
 * Кузов — первичный фильтр: у каждого свой прайс (Service.prices), выбор общий с «Какая у вас BMW?» на главной.
 * Второй шаг — мотор (bmw_bodies.engines): с ним цена точная, без него — вилка по моторам кузова.
 * Кузов не выбран или «другая BMW» — общая «от» (минимум по кузовам). Цена на весь кузов — точная сразу.
 * Плитка или чип сужают до группы (Lalafo «Поиск по категориям»), ввод в поиске ищет по всем группам
 * и раскладывает найденное по группам (Компаньон «Поиск услуг»). Состояние — в адресе: ?body=E36&motor=2.5i&q=…&group=…
 * Без JS — все группы списком, плитки ведут якорями к секциям.
 */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { Service, ServiceCategory } from '@/data/types'
import { formatPrice, formatYears, plural } from '@/lib/format'
import { saveMotor, useMotorChoice } from '@/lib/body-store'
import { takeHandoff } from '@/lib/search-handoff'
import { PRICE_SEARCH_ANCHOR } from '../blocks/PriceSearch'
import { SERVICE_CATEGORIES, formatServicePrice, highlight, matchServices, priceFor, priceLow, resolveQuery, type SearchQuery, type ServicePriceView } from '@/lib/services'
import { BodyPicker } from '../contact/BodyPicker'
import { LeadButton } from '../contact/LeadButton'
import { useContact } from '../contact/ContactProvider'
import { Icon } from '../icons/Icon'
import { telegramUrl } from '@/lib/message'
import styles from './PriceCatalog.module.css'

const QUICK = ['Колодки', 'ГРМ', 'Сцепление', 'Амортизатор', 'Помпа', 'Генератор', 'Кондиционер']

const anchor = (c: ServiceCategory | 'other') => `group-${c}`
const isCategory = (v: string | null): v is ServiceCategory => SERVICE_CATEGORIES.some((c) => c.value === v)

export function PriceCatalog({ services }: { services: Service[] }) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<ServiceCategory | null>(null)
  const deferredQuery = useDeferredValue(query)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { bodies, body, setBody } = useContact()
  const code = body?.kind === 'body' ? body.code : null
  const chosen = bodies.find((b) => b.code === code) ?? null
  /* выбранный кузов сворачивается в строку; «Сменить» разворачивает плитки обратно */
  const [picking, setPicking] = useState(false)
  const engines = chosen?.engines ?? []
  const [motor, setMotor] = useMotorChoice(code, engines)
  const price = (s: Service) => priceFor(s, code, motor)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const handedOff = useRef(false)

  /* адрес → состояние один раз при заходе: ссылку «/service?group=brakes» можно прислать */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const g = params.get('group')
    const b = params.get('body')
    // пришли поиском с главной: набранное свежее адреса, фокус ещё в поле каркаса (lib/search-handoff)
    const handed = takeHandoff()
    if (handed !== null) {
      setQuery(handed)
      handedOff.current = true
    } else if (q) setQuery(q)
    if (isCategory(g)) setGroup(g)
    const linked = bodies.find((x) => x.code === b)
    if (linked) {
      setBody({ kind: 'body', code: linked.code })
      const m = params.get('motor')
      if (m && linked.engines.includes(m)) saveMotor(linked.code, m)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- только при заходе
  }, [])

  /* эстафета: фокус в поле прайса (клавиатура телефона не закрывается), поле — под шапку, результаты под ним */
  useEffect(() => {
    if (!handedOff.current) return
    handedOff.current = false
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    input.setSelectionRange(input.value.length, input.value.length)
    requestAnimationFrame(() => searchRef.current?.scrollIntoView({ block: 'start' }))
  }, [query])

  /* состояние → адрес без новой записи в истории */
  useEffect(() => {
    const params = new URLSearchParams()
    if (code) params.set('body', code)
    if (motor) params.set('motor', motor)
    if (deferredQuery.trim()) params.set('q', deferredQuery.trim())
    if (group) params.set('group', group)
    const search = params.toString()
    window.history.replaceState(window.history.state, '', search ? `?${search}` : window.location.pathname)
  }, [deferredQuery, group, code, motor])

  const groups = useMemo(
    () =>
      SERVICE_CATEGORIES.map((c) => {
        const items = services.filter((s) => s.category === c.value)
        const prices = items.map((s) => priceLow(priceFor(s, code, motor))).filter((p): p is number => Boolean(p))
        return { ...c, items, min: prices.length ? Math.min(...prices) : null }
      }).filter((g) => g.items.length > 0),
    [services, code, motor],
  )
  const other = useMemo(() => services.filter((s) => !s.category), [services])

  const words = useMemo(() => resolveQuery(services, deferredQuery), [services, deferredQuery])
  const searching = words.length > 0
  const found = useMemo(() => matchServices(services, words, group), [services, words, group])
  /* при поиске чипы считают совпадения по всем группам — видно, где ещё нашлось */
  const counts = useMemo(() => {
    const all = searching ? matchServices(services, words, null) : services
    const map = new Map<ServiceCategory | null, number>()
    for (const s of all) map.set(s.category, (map.get(s.category) ?? 0) + 1)
    return { total: all.length, of: (c: ServiceCategory) => map.get(c) ?? 0 }
  }, [services, words, searching])

  /* найденное по группам в порядке плиток; при поиске — сначала группы с совпадением в названии */
  const sections = useMemo(() => {
    const list = groups
      .map((g) => ({ key: g.value as ServiceCategory | 'other', label: g.label, icon: g.icon, items: found.filter((s) => s.category === g.value) }))
      .filter((g) => g.items.length > 0)
    const rest = found.filter((s) => !s.category)
    if (rest.length) list.push({ key: 'other', label: 'Другое', icon: 'wrench', items: rest })
    if (searching) list.sort((a, b) => found.indexOf(a.items[0]) - found.indexOf(b.items[0]))
    return list
  }, [groups, found, searching])

  const pick = (g: ServiceCategory | null) => {
    setGroup(g)
    // к началу списка, если он ушёл выше экрана
    requestAnimationFrame(() => {
      const el = resultsRef.current
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const reset = () => {
    setQuery('')
    setGroup(null)
  }

  const showHub = !searching && group === null

  const showPicker = bodies.length > 0 && (!body || picking)

  return (
    <div className={styles.catalog}>
      {bodies.length > 0 ? (
        <section id="body" className={styles.bodyStep} aria-labelledby="body-step-title">
          {showPicker ? (
            <>
              <div className={styles.stepHead}>
                <h2 id="body-step-title" className={styles.stepTitle}>
                  <span className={styles.stepNum}>1</span>
                  Какая у вас BMW?
                </h2>
                <p className={`t-small ${styles.stepHint}`}>У каждого кузова свой прайс — покажем цены для вашего</p>
              </div>
              <BodyPicker
                bodies={bodies}
                value={body}
                otherHint="цену назовём по сообщению"
                onChange={(choice) => {
                  setBody(choice)
                  if (choice) setPicking(false)
                }}
              />
            </>
          ) : (
            <div className={styles.bodyChosen}>
              <h2 id="body-step-title" className={styles.chosenTitle}>
                <span className={styles.chosenLabel}>Цены для</span>
                {chosen ? (
                  <>
                    <span className={styles.chosenCode}>BMW {chosen.code}</span>
                    {formatYears(chosen) ? <span className={styles.chosenYears}>{formatYears(chosen)}</span> : null}
                  </>
                ) : (
                  <span className={styles.chosenCode}>другой BMW</span>
                )}
              </h2>
              {chosen && motor ? <span className={styles.chosenMotor}>{motor}</span> : null}
              {!chosen ? <p className={`t-small ${styles.stepHint}`}>Показываем минимальные цены — точную назовём по сообщению</p> : null}
              <button type="button" className={styles.change} onClick={() => setPicking(true)}>
                Сменить
              </button>
              {engines.length > 0 ? (
                <div className={styles.motorStep}>
                  <p className={styles.motorTitle}>
                    <span className={styles.stepNum}>2</span>
                    Мотор
                    <span className={`t-small ${styles.stepHint}`}>
                      {motor ? 'цены точные для этого мотора' : 'выберите — покажем точную цену, пока вилка по моторам'}
                    </span>
                  </p>
                  <div className={styles.motors} role="group" aria-label={`Мотор BMW ${chosen?.code}`}>
                    {engines.map((m) => (
                      <button key={m} type="button" className={styles.motor} aria-pressed={motor === m} onClick={() => setMotor(motor === m ? null : m)}>
                        {m}
                      </button>
                    ))}
                    <button type="button" className={styles.motor} aria-pressed={motor === null} onClick={() => setMotor(null)}>
                      Не знаю
                    </button>
                  </div>
                  <p className={`t-small ${styles.stepHint}`}>i — бензин, d и tds — дизель. Объём и код мотора есть в ПТС: строка «Модель, № двигателя» — N47D20… значит N47</p>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      <div className={styles.searchBlock} id={PRICE_SEARCH_ANCHOR} ref={searchRef}>
        <label className={styles.search}>
          <Icon name="search" className={styles.searchIcon} />
          <span className="sr-only">Поиск по прайсу</span>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder="Колодки, ГРМ, помпа…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
          />
          {query ? (
            <button type="button" className={styles.searchClear} onClick={() => setQuery('')} aria-label="Очистить поиск">
              <Icon name="close" />
            </button>
          ) : null}
        </label>
        {!query ? (
          <ul className={styles.quick} aria-label="Часто ищут">
            {QUICK.map((q) => (
              <li key={q}>
                <button type="button" className={styles.quickChip} onClick={() => setQuery(q)}>
                  {q}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showHub ? (
        <ul className={styles.hub} aria-label="Группы работ">
          {groups.map((g) => (
            <li key={g.value}>
              <a
                href={`#${anchor(g.value)}`}
                className={styles.tile}
                onClick={(e) => {
                  e.preventDefault()
                  pick(g.value)
                }}
              >
                <Icon name={g.icon} className={styles.tileIcon} />
                <span className={styles.tileName}>{g.label}</span>
                <span className={styles.tileMeta}>
                  {g.items.length} {plural(g.items.length, 'работа', 'работы', 'работ')}
                  {g.min ? <span className={styles.tilePrice}> · {formatPrice(g.min)}</span> : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.results} ref={resultsRef}>
        <div className={styles.bar}>
          <div className={styles.chips} role="group" aria-label="Группа работ">
            <button type="button" className={styles.chip} aria-pressed={group === null} onClick={() => pick(null)}>
              Все <span className={styles.chipCount}>{counts.total}</span>
            </button>
            {groups.map((g) => (
              <button
                key={g.value}
                type="button"
                className={styles.chip}
                aria-pressed={group === g.value}
                data-empty={counts.of(g.value) === 0 || undefined}
                onClick={() => pick(group === g.value ? null : g.value)}
              >
                {g.label} <span className={styles.chipCount}>{counts.of(g.value)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.main}>
        {searching && bodies.length > 0 ? (
          <Refine
            bodies={bodies}
            code={code}
            other={body?.kind === 'other'}
            engines={engines}
            motor={motor}
            needMotor={found.some((s) => price(s)?.kind === 'range')}
            onBody={(c) => setBody({ kind: 'body', code: c })}
            onMotor={setMotor}
            onChange={() => {
              setPicking(true)
              document.getElementById('body')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        ) : null}
        <p className={`t-small ${styles.status}`} aria-live="polite">
          {searching || group
            ? found.length
              ? `${found.length} ${plural(found.length, 'работа', 'работы', 'работ')}${searching ? ` по запросу «${deferredQuery.trim()}»` : ''}`
              : ''
            : `${services.length} ${plural(services.length, 'работа', 'работы', 'работ')} в ${groups.length + (other.length ? 1 : 0)} группах`}
          {(searching || group) && found.length ? (
            <button type="button" className={styles.resetInline} onClick={reset}>
              Сбросить
            </button>
          ) : null}
        </p>

        {sections.length > 0 ? (
          sections.map((sec) => (
            <section key={sec.key} id={anchor(sec.key)} className={styles.group} aria-labelledby={`${anchor(sec.key)}-title`}>
              <h2 id={`${anchor(sec.key)}-title`} className={styles.groupTitle}>
                <Icon name={sec.icon} className={styles.groupIcon} />
                <span className="t-display t-h3">{sec.label}</span>
                <span className={styles.groupCount}>{sec.items.length}</span>
              </h2>
              <ul className={styles.list}>
                {sec.items.map((s) => (
                  <PriceRow key={s.id} service={s} price={price(s)} motor={motor} words={words} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Такой работы нет в прайсе</p>
            <p className={`t-small ${styles.emptyText}`}>
              Скорее всего, сделаем и её. Напишите, что с машиной, — назовём цену и срок.
            </p>
            <div className={styles.emptyActions}>
              <LeadButton
                lead={{ topic: 'repair', section: deferredQuery.trim() || undefined, source: 'прайс Gal service' }}
                icon="telegram"
              >
                Спросить про ремонт
              </LeadButton>
              <button type="button" className={styles.resetInline} onClick={reset}>
                Сбросить поиск
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

/*
 * Уточнение над результатами поиска — чтобы цена стала точной, не уходя от найденного:
 * кузов не выбран → коды кузовов; кузов есть, в найденном вилки → моторы; всё выбрано → «Цены для BMW E36 · 2.5i».
 */
type RefineProps = {
  bodies: { code: string }[]
  code: string | null
  other: boolean
  engines: string[]
  motor: string | null
  needMotor: boolean
  onBody: (code: string) => void
  onMotor: (motor: string | null) => void
  onChange: () => void
}

function Refine({ bodies, code, other, engines, motor, needMotor, onBody, onMotor, onChange }: RefineProps) {
  if (other) return null
  if (!code)
    return (
      <div className={styles.refine}>
        <p className={styles.refineLabel}>Цены «от». Для точной — ваш кузов:</p>
        <div className={styles.refineChips} role="group" aria-label="Уточнить кузов">
          {bodies.map((b) => (
            <button key={b.code} type="button" className={styles.refineChip} onClick={() => onBody(b.code)}>
              {b.code}
            </button>
          ))}
        </div>
      </div>
    )
  if (engines.length && !motor && needMotor)
    return (
      <div className={styles.refine}>
        <p className={styles.refineLabel}>Цена зависит от мотора. Ваш мотор BMW {code}:</p>
        <div className={styles.refineChips} role="group" aria-label={`Уточнить мотор BMW ${code}`}>
          {engines.map((m) => (
            <button key={m} type="button" className={styles.refineChip} onClick={() => onMotor(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
    )
  return (
    <div className={`${styles.refine} ${styles.refineDone}`}>
      <p className={styles.refineLabel}>
        Цены для <b>BMW {code}{motor ? ` · ${motor}` : ''}</b>
      </p>
      <button type="button" className={styles.resetInline} onClick={onChange}>
        Сменить
      </button>
    </div>
  )
}

/* Строка прайса кликабельна целиком: сразу сообщение «Ремонт → {работа}», как строки прайса раньше на главной */
function PriceRow({ service: s, price: value, motor, words }: { service: Service; price: ServicePriceView; motor: string | null; words: SearchQuery }) {
  const { settings, startLead } = useContact()
  const price = formatServicePrice(value)

  return (
    <li className={styles.row}>
      <a
        href={telegramUrl(settings.telegram_username)}
        className={styles.rowLink}
        onClick={(e) => {
          e.preventDefault()
          startLead({ topic: 'repair', section: motor ? `${s.name}, мотор ${motor}` : s.name, source: 'прайс Gal service' })
        }}
      >
        <span className={styles.rowMain}>
          <span className={styles.rowName}>
            {highlight(s.name, words).map(([text, hit], i) => (hit ? <mark key={i}>{text}</mark> : text))}
          </span>
          {s.description || s.duration ? (
            <span className={`t-small ${styles.rowDesc}`}>{[s.description, s.duration].filter(Boolean).join(' · ')}</span>
          ) : null}
        </span>
        <span className={styles.rowPrice} data-kind={value?.kind}>
          {price ?? 'по запросу'}
        </span>
        <span className={styles.rowAction} aria-hidden="true">
          <Icon name="telegram" />
        </span>
      </a>
    </li>
  )
}
