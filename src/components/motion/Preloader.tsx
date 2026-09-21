'use client'

/*
 * Прелоадер — механика scrib3-prod (счётчик 0→100%, минимум по времени, до события load держится на 90%),
 * но перевёрнута: счётчик стоит по центру, а слева направо едет машина — силуэт седана 90-х
 * в стиле иконок сайта (контур 1,75), колёса крутятся ровно на пройденный путь.
 *
 * Показ — на каждой полной загрузке (переходы внутри сайта его не вызывают) и только при включённой анимации: решает скрипт в <head> (layout.tsx),
 * он ставит html.is-loading до первой отрисовки. Без JS прелоадера нет — страница видна сразу.
 */
import { useRef } from 'react'
import { gsap, startIntro, useGSAP } from '@/lib/motion'
import styles from './Preloader.module.css'

/** минимальное время прогресса, с */
const MIN_DURATION = 2.2
/** потолок, пока не пришёл window load */
const HOLD_AT = 0.9
/** максимальная скорость догоняния после load, долей в секунду */
const CATCH_UP = 0.8
/** радиус колеса в единицах viewBox машины */
const WHEEL_R = 10
const CAR_VIEWBOX_W = 160

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const html = document.documentElement
      html.classList.add('motion-ready')

      if (!html.classList.contains('is-loading') || !root.current) {
        startIntro()
        return
      }

      const el = root.current
      const q = gsap.utils.selector(el)
      const svg = <T extends Element>(sel: string) => el.querySelector<T>(sel)!
      const count = q('[data-count]')[0] as HTMLElement
      const road = q('[data-road]')[0] as HTMLElement
      const car = q('[data-car]')[0] as HTMLElement
      const body = svg<SVGGElement>('[data-car-body]')
      const wheels = Array.from(el.querySelectorAll<SVGGElement>('[data-wheel]'))
      const speed = svg<SVGGElement>('[data-speed]')
      const fill = q('[data-fill]')[0] as HTMLElement

      window.scrollTo(0, 0)

      let loaded = document.readyState === 'complete'
      const onLoad = () => (loaded = true)
      window.addEventListener('load', onLoad, { once: true })

      let elapsed = 0
      let shown = 0
      let lastX = 0
      let finished = false

      const place = (x: number, dt: number) => {
        const scale = car.offsetWidth / CAR_VIEWBOX_W
        // колесо проходит 2πr за оборот — вращение честно следует за пройденным путём
        const turn = (x / (2 * Math.PI * WHEEL_R * scale)) * 360
        const velocity = dt > 0 ? Math.abs(x - lastX) / dt : 0
        lastX = x
        gsap.set(car, { x })
        gsap.set(wheels, { rotation: turn, svgOrigin: (i: number) => (i === 0 ? '40 40' : '122 40') })
        // лёгкая подвеска и «полосы скорости» от реальной скорости
        gsap.set(body, { y: Math.sin(elapsed * 38) * Math.min(velocity / 900, 0.6) })
        gsap.set(speed, { opacity: gsap.utils.clamp(0, 1, velocity / 700) })
        gsap.set(fill, { scaleX: road.offsetWidth ? (x + car.offsetWidth * 0.55) / road.offsetWidth : 0 })
      }

      const tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 64) / 1000
        elapsed += dt
        const target = loaded ? Math.min(elapsed / MIN_DURATION, 1) : Math.min(elapsed / MIN_DURATION, HOLD_AT)
        // обычно shown === target; после задержки load догоняет плавно, а не прыжком 90 → 100
        shown = Math.min(target, shown + dt * CATCH_UP)
        count.textContent = String(Math.round(shown * 100))
        place(easeInOutCubic(shown) * (road.offsetWidth - car.offsetWidth), dt)
        if (shown >= 1 && !finished) {
          finished = true
          gsap.ticker.remove(tick)
          leave()
        }
      }

      const leave = () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            html.classList.remove('is-loading')
            gsap.set(el, { display: 'none' })
          },
        })
        const from = { x: road.offsetWidth - car.offsetWidth }
        // машина разгоняется и уезжает за край — разгон здесь физичен, поэтому power2.in
        tl.to(from, {
          x: road.offsetWidth + car.offsetWidth * 0.2,
          duration: 0.55,
          ease: 'power2.in',
          onUpdate: () => place(from.x, 1 / 60),
        })
          .to(q('[data-count-line]'), { yPercent: -105, duration: 0.6, stagger: 0.06 }, 0.1)
          .to(q('[data-fade]'), { autoAlpha: 0, y: -12, duration: 0.4, stagger: 0.04 }, 0.1)
          .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'power4.inOut' }, 0.35)
          // интро стартует вместе со шторкой: фото первого экрана раскрывается, пока она уходит
          .add(startIntro, 0.4)
      }

      gsap.ticker.add(tick)

      return () => {
        gsap.ticker.remove(tick)
        window.removeEventListener('load', onLoad)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className={styles.root} aria-hidden="true" data-preloader>
      <div className={styles.center}>
        <p className={`t-eyebrow ${styles.eyebrow}`} data-fade>
          Parts · Service · Custom
        </p>
        <p className={styles.count}>
          <span className={styles.countMask}>
            <span className={styles.countLine} data-count-line>
              <span data-count>0</span>
              <span className={styles.percent}>%</span>
            </span>
          </span>
        </p>
        <p className={`t-script ${styles.script}`} data-fade>
          Движимы страстью
        </p>
      </div>

      <div className={styles.road} data-road>
        <span className={styles.line} />
        <span className={styles.fill} data-fill />
        <div className={styles.car} data-car>
          <CarSvg />
        </div>
      </div>
    </div>
  )
}

/* Силуэт седана 90-х сбоку: длинный капот, низкая крыша, короткий багажник. Без решётки и шильдиков. */
function CarSvg() {
  return (
    <svg viewBox="0 0 160 56" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <g data-speed className={styles.speed}>
        <path d="M-26 22h14M-34 31h20M-24 40h10" />
      </g>
      <g data-car-body>
        <path d="M27 40H8.5a2.5 2.5 0 0 1-2.5-2.5V31l4-4.5 25-1.5 13.5-10.5c1-.7 2.1-1 3.3-1H90c1.3 0 2.5.5 3.4 1.4L106 25l38 2.6c3.3.2 6.3 2.2 7.4 5.3l.6 1.9V38a2 2 0 0 1-2 2h-15" />
        <path d="M53 40h56" />
        <path d="M53 40a13 13 0 0 0-26 0M135 40a13 13 0 0 0-26 0" />
        <path d="M52 24.5 57.5 17h19v7.5zM80 17h11l10 7.5H80z" />
        <path d="M143 30.5h5.5" />
        <path d="M8 31.5h4" />
        <path d="M72 29h5" />
        <path className={styles.stripe} d="M12 34.5h13M55 34.5h50M136 34.5h11" />
      </g>
      {[40, 122].map((cx) => (
        <g key={cx} data-wheel>
          <circle cx={cx} cy={40} r={WHEEL_R} />
          <circle cx={cx} cy={40} r={3} />
          <path d={`M${cx} 33v-2.5M${cx} 47v2.5M${cx - 7} 40h-2.5M${cx + 7} 40h2.5`} />
        </g>
      ))}
    </svg>
  )
}
