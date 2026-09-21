import type { Metadata, Viewport } from 'next'
import { Manrope, Marck_Script, Unbounded } from 'next/font/google'
import type { ReactNode } from 'react'
import { getBodies, getSettings } from '@/data'
import { ContactProvider } from '@/components/contact/ContactProvider'
import { Header } from '@/components/blocks/Header'
import { Footer } from '@/components/blocks/Footer'
import { DisplayLines } from '@/components/motion/DisplayLines'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { Preloader } from '@/components/motion/Preloader'
import '@/styles/globals.css'

// visual-direction.md §8: Unbounded 800–900, Manrope 400/500/600/800; надпись — Marck Script (у Satisfy нет кириллицы)
const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'], weight: ['800', '900'], variable: '--font-unbounded', display: 'swap' })
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '800'], variable: '--font-manrope', display: 'swap' })
// Рукописная надпись «Движимы страстью»: видна уже в прелоадере, поэтому грузится сразу — иначе подмена шрифта на глазах
const script = Marck_Script({ subsets: ['latin', 'cyrillic'], weight: '400', variable: '--font-script-face', display: 'swap' })

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  // title с регионом; без него — запасной
  const title = s.city_prepositional ? `Запчасти BMW в наличии и под заказ ${s.city_prepositional} — GAL` : 'Запчасти BMW под заказ, подбор по VIN — GAL'
  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title,
    description:
      'Б/у оригинальные запчасти для BMW в наличии и под заказ: подбор по VIN, цены от. Ремонт в Gal service, перешив салонов в Gal custom. Пишите нам.',
    openGraph: {
      title: 'GAL — запчасти BMW под заказ',
      description:
        'Напишите VIN и какая деталь нужна — подберём её со склада или привезём и назовём цену. Ремонт и перешив салонов тоже здесь.',
      siteName: 'GAL',
      locale: 'ru_RU',
      type: 'website',
      // og:image 1200×630 — после выбора логотипа (assets/logo/README.md)
    },
  }
}

/*
 * До первой отрисовки: html.motion — анимация разрешена системой; html.is-loading — прелоадер (каждая полная загрузка).
 * Страховка: если скрипты сайта не поднялись за 6 с, классы снимаются и страница видна без анимации.
 */
const MOTION_BOOT = `(function(){var d=document.documentElement;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion','is-loading')}catch(e){}setTimeout(function(){if(!d.classList.contains('motion-ready'))d.classList.remove('motion','is-loading')},6000)})()`

export const viewport: Viewport = {
  themeColor: '#070707',
  colorScheme: 'dark',
}

export default async function RootLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  const [settings, bodies] = await Promise.all([getSettings(), getBodies()])

  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
      </head>
      <body>
        <Preloader />
        <MotionProvider />
        <ContactProvider settings={settings} bodies={bodies}>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer settings={settings} />
          {modal}
        </ContactProvider>
        <DisplayLines />
      </body>
    </html>
  )
}
