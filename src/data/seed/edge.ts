/*
 * Seed `edge` — крайние случаи из content-model.md «Наборы seed». Только локально:
 * GAL_SEED=edge npm run dev
 */
import type { PartPosition, Seed } from '../types'
import { demo } from './demo'

const pos = (section: string, i: number, patch: Partial<PartPosition>): PartPosition => ({
  id: `${section}-edge-${i}`,
  section,
  name: `Деталь ${i}`,
  bodies: ['E39'],
  spec_note: null,
  price_from: 5000 + i * 500,
  photo: null,
  sort: i,
  status: 'published',
  is_demo: true,
  ...patch,
})

const sections = demo.part_sections.map((s) => {
  // раздел без обложки и с незнакомой иконкой
  if (s.slug === 'electronics') return { ...s, cover: null, icon: 'generic' as const }
  // скрытый раздел — плитки нет, /parts/interior → /#parts
  if (s.slug === 'interior') return { ...s, status: 'draft' as const }
  return s
})

const positions: PartPosition[] = [
  // engine — 0 позиций
  // transmission — 1 позиция
  pos('transmission', 1, { name: 'АКПП ZF 6HP', bodies: ['E60'] }),
  // suspension — 25 позиций
  ...Array.from({ length: 25 }, (_, i) => pos('suspension', i + 1, { bodies: i % 3 ? ['F30'] : ['E39'] })),
  // lighting — крайние карточки
  pos('lighting', 1, { name: 'Фара передняя левая адаптивная с омывателем ксенон', bodies: ['E39'] }),
  pos('lighting', 2, { name: 'Артикул63117165779A63117165780B63117165781C', bodies: ['E60'] }),
  pos('lighting', 3, {
    name: 'Блок розжига',
    bodies: ['E30', 'F30', 'G20', 'E28', 'E34', 'E39', 'E60', 'F10', 'G30'],
    spec_note: 'рестайлинг · ксенон',
  }),
  pos('lighting', 4, { name: 'Без фото, цены и кузовов', bodies: [], price_from: null }),
  pos('lighting', 5, { name: 'Повторитель', bodies: ['E34'], price_from: 9999999 }),
]

export const edge: Seed = {
  ...demo,
  part_sections: sections,
  part_positions: positions,
  bmw_bodies: [
    ...demo.bmw_bodies.map((b) => ({ ...b, status: 'published' as const })),
    { id: 'E46 M3', code: 'E46 M3', series: 'M', sort: 1, years_from: null, years_to: null, status: 'published' },
  ],
  services: [
    ...demo.services,
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `svc-edge-${i}`,
      name: i === 0 ? 'Название услуги ровно в сорок символов ок' : `Услуга без цены ${i}`,
      description: null,
      price_from: i === 0 ? 9999999 : null,
      duration: null,
      sort: 10 + i,
      status: 'published' as const,
      is_demo: true,
    })),
  ],
  works: demo.works.filter((w) => w.direction === 'service' || w.id === 'custom-wheel-e60' || w.id === 'custom-seat-example'),
  faq: [
    {
      id: 'faq-edge',
      question: 'Очень длинный вопрос ровно на девяносто символов, чтобы проверить перенос строк в аккордеоне?',
      answer: `${'Длинный ответ для проверки высоты раскрытого блока. '.repeat(6)}\n\nВторой абзац ответа — абзацы через пустую строку, до трёх. Ссылка https://example.com выводится текстом.`,
      sort: 1,
      status: 'published',
      is_demo: true,
    },
  ],
  stats: [],
  site_settings: {
    ...demo.site_settings,
    phone: null,
    whatsapp: false,
    ivan_photo: null,
    ivan_photo_consent: false,
    city_prepositional: null,
    locations: [],
    legal_form: null,
    legal_name: null,
    inn: null,
    parts_counter_value: null,
    parts_counter_suffix: null,
    parts_counter_label: null,
    socials: [],
    email: null,
  },
}
