/* Прямой заход на /parts/[slug] — та же разметка отдельной страницей (structure.md §3) */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getPositions, getSection, getSections } from '@/data'
import { SectionView } from '@/components/parts/SectionView'
import { Icon } from '@/components/icons/Icon'
import styles from './page.module.css'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getSections()).map((s) => ({ slug: s.slug }))
}

function cutByWord(text: string, limit: number) {
  if (text.length <= limit) return text
  return text.slice(0, text.lastIndexOf(' ', limit)).replace(/[,.;:—\s]+$/, '')
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const section = await getSection((await params).slug)
  if (!section || section === 'hidden') return {}
  return {
    title: section.seo_title ?? `${section.name} BMW под заказ | GAL`,
    description: section.seo_description ?? cutByWord(`${section.description} Свяжитесь с нами в Telegram.`, 160),
    alternates: { canonical: `/parts/${section.slug}` },
  }
}

export default async function PartsPage({ params }: Params) {
  const section = await getSection((await params).slug)
  if (section === null) notFound()
  // скрытый раздел — не 404, а к разделам (content.md «404»)
  if (section === 'hidden') redirect('/#parts')
  const positions = await getPositions(section.id)

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/#parts" className={styles.back}>
        <Icon name="arrowLeft" className={styles.backIcon} />
        <span className="only-desktop">Все разделы</span>
        <span className="only-mobile">Разделы</span>
      </Link>
      <SectionView section={section} positions={positions} headingLevel="h1" titleId="section-title" />
    </div>
  )
}
