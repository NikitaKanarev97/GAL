/* Попап раздела при переходе с главной — intercepting route (prd.md, решение 1) */
import { redirect } from 'next/navigation'
import { getPositions, getSection } from '@/data'
import { PartsModal } from '@/components/parts/PartsModal'

export default async function PartsModalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = await getSection(slug)
  if (section === null || section === 'hidden') redirect('/#parts')
  const positions = await getPositions(section.id)
  return <PartsModal section={section} positions={positions} />
}
