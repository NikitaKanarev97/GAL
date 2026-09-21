/*
 * Иконки — visual-direction.md §8 «Иконки»: контур 1,75 на сетке 24,
 * скруглённые концы и стыки, без заливок. Цвет — currentColor (компонент
 * ставит var(--accent)). Медальная версия — HexBadge.
 */
import type { ReactNode, SVGProps } from 'react'
import type { SectionIcon } from '@/data/types'

const paths = {
  // ── Разделы ─────────────────────────────────────────────
  engine: (
    <>
      <path d="M9 4h6M12 4v3" />
      <path d="M6 7h9l2 2h2v2h2v4h-2v2h-3l-2 2H9l-3-3V7z" />
      <path d="M3 10v5M3 12.5h3" />
    </>
  ),
  transmission: (
    <>
      <circle cx="5" cy="5" r="1.75" />
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="19" cy="5" r="1.75" />
      <circle cx="5" cy="19" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
      <path d="M5 6.75v10.5M12 6.75v10.5M19 6.75V12H5" />
    </>
  ),
  suspension: (
    <>
      <path d="M12 2.5V5M12 19v2.5" />
      <path d="M7.5 5h9M7.5 19h9" />
      <path d="M8 7.5l8 2-8 2 8 2-8 2 8 2" />
    </>
  ),
  lighting: (
    <>
      <path d="M14.5 5C18.1 5 21 8.1 21 12s-2.9 7-6.5 7c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" />
      <path d="M3 8.5h6M3 12h6M3 15.5h6" />
    </>
  ),
  body: (
    <>
      <path d="M5 16.5H3v-4.2l2.8-1.1L9 7h6.5l4 4.2 1.5.6v4.7h-1.5" />
      <path d="M9.5 16.5h5M8.3 11.2h11" />
      <circle cx="7.25" cy="16.5" r="2" />
      <circle cx="16.75" cy="16.5" r="2" />
    </>
  ),
  electronics: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9.5 2.5V6M14.5 2.5V6M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5" />
    </>
  ),
  interior: (
    <>
      <path d="M8.6 3h3a1.5 1.5 0 0 1 1.5 1.7L12 13.5H8L7.1 4.7A1.5 1.5 0 0 1 8.6 3z" />
      <path d="M6.5 13.5H17a2 2 0 0 1 2 2V17H8.2a2 2 0 0 1-1.9-1.4L5.8 14" />
      <path d="M9.5 17v4M16.5 17v4M7.5 21h11" />
    </>
  ),
  generic: (
    <>
      <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
      <path d="M4 7l8 4 8-4M12 11v10M8 5l8 4" />
    </>
  ),

  // ── Почему GAL ──────────────────────────────────────────
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-6 7-6s6.2 2.4 7 6" />
    </>
  ),
  fit: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  order: (
    <>
      <path d="M13.5 16.5V6h-11v10.5h2" />
      <path d="M13.5 9h4l3.5 4v3.5h-1.5M9 16.5h6.5" />
      <circle cx="6.75" cy="17" r="2" />
      <circle cx="17.75" cy="17" r="2" />
    </>
  ),
  tested: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.25l2.5 2.5 4.5-5" />
    </>
  ),
  wrench: (
    <path d="M14.5 3.5a5 5 0 0 0-4.8 6.4L3.5 16.1a2 2 0 0 0 2.8 2.8l6.2-6.2a5 5 0 0 0 6.4-4.8l-2.9 2.9-2.8-.5-.5-2.8 2.8-2.9a5 5 0 0 0-1-.1z" />
  ),
  allInOne: (
    <>
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5l9 4.5 9-4.5" />
    </>
  ),

  // ── Плашки из макета (custom-wide.jpg) ─────────────────
  warranty: (
    <>
      <path d="M12 3l7 2.5v6c0 4.3-3 7.8-7 9.5-4-1.7-7-5.2-7-9.5v-6L12 3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  material: (
    <>
      <path d="M7 4h10l4 5-9 11L3 9l4-5z" />
      <path d="M3 9h18M9.5 4L8 9l4 11 4-11-1.5-5" />
    </>
  ),

  // ── Интерфейс ───────────────────────────────────────────
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H4M10 6l-6 6 6 6" />,
  telegram: (
    <>
      <path d="M21 4L3 11l6.5 2.5M21 4l-3.5 16-6.5-5M21 4L9.5 13.5V19l3-3.3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  burger: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="1.5" />
      <path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5" />
    </>
  ),
  phone: (
    <path d="M5 3.5h3.5l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-1.5z" />
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4.3A8.5 8.5 0 1 1 8 19.3l-4.5 1.2z" />
      <path d="M9 8.5c0 3.3 3.2 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2L9 8.5z" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
      <path d="M10 9.25v5.5l4.75-2.75L10 9.25z" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M3.5 6l8.5 7 8.5-7" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

type Props = SVGProps<SVGSVGElement> & { name: IconName; title?: string }

export function Icon({ name, title, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  )
}

export const SECTION_ICONS: Record<SectionIcon, IconName> = {
  engine: 'engine',
  transmission: 'transmission',
  suspension: 'suspension',
  lighting: 'lighting',
  body: 'body',
  electronics: 'electronics',
  interior: 'interior',
  generic: 'generic',
}

export const ALL_ICONS = Object.keys(paths) as IconName[]
