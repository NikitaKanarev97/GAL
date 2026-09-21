/*
 * Контракт данных — ровно поля коллекций Directus из content-model.md.
 * На этапе 5 эти же типы заполняет клиент Directus вместо моков.
 */
import type { StaticImageData } from 'next/image'

export type Status = 'published' | 'draft' | 'archived'

/** Файл Directus. Для моков src — статический импорт из /assets. */
export type DirectusFile = {
  id: string
  src: StaticImageData | string
  width: number
  height: number
  /** Фокус-точка в долях 0–1; не задана — центр */
  focal_point_x?: number | null
  focal_point_y?: number | null
}

type Base = {
  id: string
  status: Status
  sort: number
}

type Demo = { is_demo: boolean }

export type SectionIcon =
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'lighting'
  | 'body'
  | 'electronics'
  | 'interior'
  | 'generic'

/** 1. part_sections */
export type PartSection = Base & {
  name: string
  slug: string
  description: string
  description_short: string | null
  cover: DirectusFile | null
  icon: SectionIcon
  seo_title: string | null
  seo_description: string | null
}

/** 2. part_positions */
export type PartPosition = Base &
  Demo & {
    section: string
    name: string
    /** M2M → bmw_bodies.id */
    bodies: string[]
    spec_note: string | null
    price_from: number | null
    photo: DirectusFile | null
  }

export type Series = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'X' | 'Z' | 'M'

/** 3. bmw_bodies — sort внутри серии */
export type BmwBody = Base & {
  code: string
  series: Series
  years_from: number | null
  years_to: number | null
}

/** 4. services */
export type Service = Base &
  Demo & {
    name: string
    description: string | null
    price_from: number | null
    duration: string | null
  }

/** 5. work_pairs */
export type WorkPair = {
  id: string
  work: string
  before: DirectusFile
  after: DirectusFile
  caption: string | null
  sort: number
  /** Подгонка под ракурс второго реального снимка; проценты от размера рамки. */
  after_alignment?: { x: number; y: number; scale: number }
}

/** 5. works */
export type Work = Base &
  Demo & {
    direction: 'service' | 'custom'
    title: string
    car: string
    year: number | null
    description: string | null
    /** пост об этой работе в Telegram-канале (Service); пусто — у карточки нет своей ссылки, только общая на канал */
    post_url?: string | null
    cover: DirectusFile | null
    pairs: WorkPair[]
    photos: DirectusFile[]
  }

/** 6. faq */
export type Faq = Base &
  Demo & {
    question: string
    answer: string
  }

/** 7. stats */
export type Stat = Base &
  Demo & {
    value: number
    suffix: string | null
    label: string
  }

/** 8. site_settings → socials (повторяемая группа) */
export type Social = {
  id: string
  sort: number
  type: 'instagram' | 'telegram_channel' | 'youtube' | 'vk'
  label: string
  handle: string
  url: string
  show_in_custom: boolean
}

/** 8. site_settings → locations (повторяемая группа) */
export type Location = {
  id: string
  sort: number
  kind: 'workshop' | 'pickup'
  name: string
  city: string
  city_prepositional: string | null
  address: string
  purpose: string | null
  hours: string | null
  visit_allowed: boolean | null
  yandex_maps_url: string | null
  twogis_url: string | null
  yandex_rating: number | null
}

/** 8. site_settings (singleton) */
export type SiteSettings = {
  telegram_username: string
  contact_name: string
  contact_name_dative: string
  ivan_photo: DirectusFile | null
  ivan_photo_consent: boolean
  intro: string | null
  intro_short: string | null
  response_time: string | null

  phone: string | null
  phone_calls: boolean
  whatsapp: boolean
  socials: Social[]
  email: string | null

  city_prepositional: string | null
  locations: Location[]
  timezone: string

  legal_form: 'ИП' | 'самозанятый' | 'ООО' | null
  legal_name: string | null
  inn: string | null
  ogrn: string | null

  parts_counter_value: number | null
  parts_counter_suffix: string | null
  parts_counter_label: string | null
  service_image: DirectusFile | null
  custom_banner: DirectusFile | null
}

export type Seed = {
  part_sections: PartSection[]
  part_positions: PartPosition[]
  bmw_bodies: BmwBody[]
  services: Service[]
  works: Work[]
  faq: Faq[]
  stats: Stat[]
  site_settings: SiteSettings
}
