'use client'

/* «Назад», Esc, клик вне → router.back(); фокус возвращается на плитку раздела — structure.md §3 */
import { useRouter } from 'next/navigation'
import type { PartPosition, PartSection } from '@/data/types'
import { Dialog } from '../ui/Dialog'
import { SectionView } from './SectionView'

type Props = { section: PartSection; positions: PartPosition[] }

export function PartsModal({ section, positions }: Props) {
  const router = useRouter()
  return (
    <Dialog
      open
      size="lg"
      label={section.name}
      closeLabel="Закрыть раздел"
      onClose={() => router.back()}
      returnFocus={() => document.getElementById(`tile-${section.slug}`)}
    >
      <SectionView section={section} positions={positions} headingLevel="h2" titleId={`section-${section.slug}-title`} />
    </Dialog>
  )
}
