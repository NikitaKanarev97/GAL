/*
 * Seed `demo`: факты — client-answers.md §2 (ответы от 2026-09-16), тексты — content.md.
 * Ещё выдумано: позиции и цены [долг D17], проекты Service [D23] и две работы Custom [D26] —
 * content-debt.md. Фото позиций C9 — демо и заменяются вместе с позициями.
 */
import type { BmwBody, Faq, PartPosition, PartSection, Seed, Service, SiteSettings, Stat, Work } from '../types'
import { files, positionPhotos } from './files'

const published = 'published' as const

export const part_sections: PartSection[] = (
  [
  {
    id: 'engine',
    slug: 'engine',
    name: 'Двигатель',
    description:
      'Двигатели и навесное: ГБЦ, VANOS, турбины, генераторы, стартеры, помпы, радиаторы. Подбираем по коду мотора — M30, M50, M60, M62 и другим.',
    description_short: 'Двигатели и навесное. Подбор по коду мотора.',
    cover: files.coverEngine,
    icon: 'engine',
    seo_title: 'Двигатель BMW под заказ — ГБЦ, VANOS, турбины | GAL',
    seo_description:
      'Двигатели и навесное для BMW под заказ. Подбор по коду мотора, кузову или VIN, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'transmission',
    slug: 'transmission',
    name: 'КПП',
    description:
      'Автоматы и механика, раздатки xDrive, редукторы, карданы, гидроблоки. Подбираем по коду коробки с шильдика или по VIN.',
    description_short: 'АКПП, МКПП, раздатки, редукторы. Подбор по коду коробки.',
    cover: files.coverTransmission,
    icon: 'transmission',
    seo_title: 'КПП BMW под заказ — АКПП, раздатки, редукторы | GAL',
    seo_description:
      'Автоматы, механика, раздатки и редукторы для BMW под заказ. Подбор по коду коробки или VIN, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'suspension',
    slug: 'suspension',
    name: 'Подвеска',
    description:
      'Рычаги, стойки, амортизаторы, пневмобаллоны, ступицы, подрамники, рулевые рейки. Подскажем, что лучше менять парой.',
    description_short: 'Рычаги, стойки, пневма, рулевые рейки.',
    cover: files.coverSuspension,
    icon: 'suspension',
    seo_title: 'Подвеска BMW под заказ — рычаги, пневма | GAL',
    seo_description:
      'Рычаги, стойки, пневмобаллоны и рулевые рейки для BMW под заказ. Подбор по кузову или VIN, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'lighting',
    slug: 'lighting',
    name: 'Оптика',
    description:
      'Фары, задние фонари, противотуманки, повторители, блоки розжига и кольца «ангельских глазок». Проверим, подойдёт ли деталь к рестайлингу вашего кузова, до заказа.',
    description_short: 'Фары, фонари, ПТФ, блоки розжига. Совместимость проверим до заказа.',
    cover: files.coverLighting,
    icon: 'lighting',
    seo_title: 'Оптика BMW под заказ — фары, фонари, ПТФ | GAL',
    seo_description:
      'Фары, задние фонари и блоки розжига для BMW под заказ. Подбор по кузову, VIN или фото, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'body',
    slug: 'body',
    name: 'Кузов',
    description:
      'Капоты, крылья, бамперы, двери, крышки багажника, зеркала, решётки радиатора. Комплектацию и код краски уточним до заказа.',
    description_short: 'Капоты, бамперы, двери, зеркала, решётки.',
    cover: files.coverBody,
    icon: 'body',
    seo_title: 'Кузов BMW под заказ — капоты, бамперы, двери | GAL',
    seo_description:
      'Капоты, крылья, бамперы и двери для BMW под заказ. Подбор по кузову и комплектации, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Электроника',
    description:
      'Блоки управления, мониторы и контроллеры iDrive, приборные панели, датчики, проводка. Совместимость сверяем по номеру блока.',
    description_short: 'Блоки, iDrive, приборки, датчики.',
    cover: files.coverElectronics,
    icon: 'electronics',
    seo_title: 'Электроника BMW под заказ — блоки, iDrive | GAL',
    seo_description:
      'Блоки управления, iDrive и приборные панели для BMW под заказ. Подбор по номеру блока или VIN, цены от. Свяжитесь с нами в Telegram.',
  },
  {
    id: 'interior',
    slug: 'interior',
    name: 'Салон',
    description:
      'Сиденья, рули, торпедо, дверные карты, потолки, консоли и отделка. Если салон нужно перешить — это в Gal custom.',
    description_short: 'Сиденья, рули, торпедо, отделка.',
    cover: files.coverInterior,
    icon: 'interior',
    seo_title: 'Салон BMW под заказ — сиденья, рули, торпедо | GAL',
    seo_description:
      'Сиденья, рули, торпедо и отделка салона для BMW под заказ. Подбор по кузову или VIN, цены от. Свяжитесь с нами в Telegram.',
  },
  ] satisfies Omit<PartSection, 'status' | 'sort'>[]
).map((s, i) => ({ ...s, status: published, sort: i + 1 }))

// Кузова — ответ 12: ходовые E32, E34, E38, E39. Остальные из прототипа — draft (решение 2026-09-16: на сайте только 4 ходовых)
const bodyRows: [string, BmwBody['series'], number, number | null, number | null, 'published' | 'draft'][] = [
  ['E34', '5', 1, 1988, 1996, 'published'],
  ['E39', '5', 2, 1995, 2003, 'published'],
  ['E32', '7', 1, 1986, 1994, 'published'],
  ['E38', '7', 2, 1994, 2001, 'published'],
  ['E28', '5', 3, 1981, 1988, 'draft'],
  ['E60', '5', 4, 2003, 2010, 'draft'],
  ['F10', '5', 5, 2009, 2017, 'draft'],
  ['G30', '5', 6, 2016, 2023, 'draft'],
  ['E30', '3', 1, 1982, 1994, 'draft'],
  ['F30', '3', 2, 2011, 2019, 'draft'],
  ['G20', '3', 3, 2018, null, 'draft'],
  ['E53', 'X', 1, 1999, 2006, 'draft'],
  ['E70', 'X', 2, 2006, 2013, 'draft'],
]

export const bmw_bodies: BmwBody[] = bodyRows.map(([code, series, sort, years_from, years_to, status]) => ({
  id: code,
  code,
  series,
  sort,
  years_from,
  years_to,
  status,
}))

type PosRow = [name: string, bodies: string, spec: string | null, price: number | null]

// Позиции — демо до ссылок Авито [долг D17]; кузова переведены на ходовые E3x (client-answers.md §4)
const positionRows: Record<string, PosRow[]> = {
  engine: [
    ['ГБЦ в сборе', 'E34 E39', 'M52', 60000], // цена от клиента 2026-09-18: ГБЦ M52 — от 60 000 ₽
    ['Двигатель M62 в сборе', 'E38 E39', 'V8', 200000], // цена от клиента 2026-09-18
    ['Генератор', 'E32 E34 E38', 'M60', 9500],
    ['Компрессор кондиционера', 'E38', null, 11000],
    ['Помпа', 'E34 E39', 'M50 · M52', 4000],
  ],
  transmission: [
    ['АКПП ZF 5HP', 'E38 E39', 'M62', 60000],
    ['МКПП Getrag', 'E34', 'M50', 45000],
    ['Кардан', 'E39', null, 15000],
    ['Редуктор задний', 'E39', null, 15000],
    ['Кулиса КПП', 'E34 E39', 'МКПП', 6500],
  ],
  suspension: [
    ['Пневмостойка задняя', 'E38', 'самовыравнивание', 12000],
    ['Рулевая рейка', 'E39', 'Servotronic', 18000],
    ['Рычаг передний нижний', 'E34', null, 8900],
    ['Амортизатор передний', 'E32 E34', null, 7200],
    ['Ступица задняя', 'E38 E39', null, 6500],
  ],
  lighting: [
    ['Фара передняя левая', 'E39', 'рестайлинг · ксенон', 12500],
    ['Фары «ангельские глазки», пара', 'E34', null, 45000],
    ['Фонарь задний правый', 'E38', 'рестайлинг', 8000],
    ['Блок розжига ксенона', 'E38 E39', null, 4500],
    ['Противотуманная фара левая', 'E34', null, null],
  ],
  body: [
    ['Решётка радиатора «ноздри»', 'E34', 'пара · хром', 9800],
    ['Бампер передний M-пакет', 'E39', 'под парктроники', 25000],
    ['Капот', 'E39', 'без окраски', 15000],
    ['Зеркало левое', 'E38', 'складное, с памятью', 14000],
    ['Крышка багажника', 'E34', 'седан', 10000],
  ],
  electronics: [
    ['Блок управления двигателем DME', 'E34', 'M50', 15000],
    ['Монитор бортового компьютера', 'E38 E39', '16:9', 12000],
    ['Приборная панель', 'E39', 'рестайлинг', 9000],
    ['Блок комфорта', 'E38', null, 7000],
    ['Датчик ABS передний', 'E34 E39', null, 2500],
  ],
  interior: [
    ['Руль M-Tech II', 'E34', 'кожа', 18000],
    ['Сиденья Sport, пара', 'E39', 'кожа', 60000],
    ['Торпедо', 'E38', null, 25000],
    ['Дверные карты, комплект', 'E32', null, 20000],
    ['Потолок', 'E34', null, null],
  ],
}

export const part_positions: PartPosition[] = Object.entries(positionRows).flatMap(([section, rows]) =>
  rows.map(([name, bodies, spec_note, price_from], i) => ({
    id: `${section}-${i + 1}`,
    section,
    name,
    bodies: bodies.split(' '),
    spec_note,
    price_from,
    photo: positionPhotos[section]?.[i] ?? null,
    sort: i + 1,
    status: published,
    is_demo: true,
  })),
)

// Услуги — ответ 23: сроков клиент не назвал
export const services: Service[] = (
  [
    ['ТО', null, 2500, null],
    ['Замена двигателя', null, 50000, null],
  ] as const
).map(([name, description, price_from, duration], i) => ({
  id: `service-${i + 1}`,
  name,
  description,
  price_from,
  duration,
  sort: i + 1,
  status: published,
  is_demo: false,
}))

export const works: Work[] = [
  {
    id: 'service-swap-s62',
    direction: 'service',
    sort: 1,
    title: 'Свап S62',
    car: 'BMW E39',
    year: 2025,
    description: 'Поставили мотор от M5, переделали проводку и выхлоп. Машина прошла диагностику без ошибок.',
    cover: files.serviceSwap,
    pairs: [],
    photos: [],
  },
  {
    id: 'service-air-e70',
    direction: 'service',
    sort: 2,
    title: 'Пневмоподвеска по кругу',
    car: 'BMW E70',
    year: 2025,
    description: 'Заменили баллоны, компрессор и блок клапанов — машина перестала садиться за ночь.',
    cover: files.serviceAir,
    pairs: [],
    photos: [],
  },
  {
    id: 'custom-wheel-e60',
    direction: 'custom',
    sort: 1,
    title: 'Перетяжка руля M-Sport',
    car: 'BMW E60',
    year: null,
    description: 'Перетянули руль чёрной кожей с красной строчкой. В шторке — фото клиента до и после работы; в галерее — дополнительные ракурсы.',
    cover: null,
    pairs: [
      {
        id: 'pair-wheel-e60',
        work: 'custom-wheel-e60',
        before: files.realWheelReferenceBeforeFront,
        after: files.realWheelReferenceAfterFront,
        after_alignment: { x: 1.8, y: 6.5, scale: 1.16 },
        caption: null,
        sort: 1,
      },
    ],
    photos: [files.realWheelReferenceBeforeFront, files.realWheelReferenceAfterFront, files.realWheelReferenceBefore, files.realWheelReferenceAfter],
  },
  {
    id: 'custom-pillar-recolor',
    direction: 'custom',
    sort: 2,
    title: 'Перекрас стоек салона',
    car: 'Стойки салона',
    year: null,
    description: 'Перекрасили светлую обивку стоек в тёмный цвет. В галерее — настоящие фото до работы и после неё.',
    cover: null,
    pairs: [
      {
        id: 'pair-pillar-recolor',
        work: 'custom-pillar-recolor',
        before: files.pillarWideBefore,
        after: files.pillarWideAfter,
        caption: null,
        sort: 1,
      },
    ],
    photos: [files.realPillarReferenceBefore, files.realPillarReferenceAfter],
  },
  {
    id: 'custom-seat-example',
    direction: 'custom',
    sort: 3,
    title: 'Обивка сиденья',
    car: 'Пример отделки',
    year: null,
    description: 'Пример замены изношенной обивки сиденья на чёрную кожу с тонкой строчкой.',
    cover: null,
    pairs: [{ id: 'pair-seat-example', work: 'custom-seat-example', before: files.seatBefore, after: files.seatAfter, caption: null, sort: 1 }],
    photos: [],
  },
  {
    id: 'custom-door-example',
    direction: 'custom',
    sort: 4,
    title: 'Обивка дверной карты',
    car: 'Пример отделки',
    year: null,
    description: 'Пример обновления вставки и подлокотника дверной карты с сохранением пластика и фурнитуры.',
    cover: null,
    pairs: [{ id: 'pair-door-example', work: 'custom-door-example', before: files.doorBefore, after: files.doorAfter, caption: null, sort: 1 }],
    photos: [],
  },
].map((w) => ({ ...w, direction: w.direction as Work['direction'], status: published, is_demo: !['custom-wheel-e60', 'custom-pillar-recolor'].includes(w.id) }))

// Вопросы — content.md блок 9 по ответам 11, 14, 16–18, 22, 25
export const faq: Faq[] = (
  [
    [
      'Точно подойдёт на мою машину?',
      'Перед продажей подбираем деталь по VIN вашей машины. Пришлите VIN и название детали — так надёжнее всего.',
    ],
    [
      'Сколько ждать деталь?',
      'Если деталь на складе — забирайте сами или отправим в течение 2 дней после оплаты. Из-за рубежа — 45–90 дней. Точный срок назовём до оплаты.',
    ],
    [
      'Детали оригинальные?',
      'Да, это б/у оригинал, снятый с машин: со своего разбора или из-за границы. Новых деталей и аналогов нет. Перед продажей деталь проверяем, моем и готовим.',
    ],
    [
      'Как платить?',
      'На сайте оплаты нет. Самовывоз — оплата на месте. Отправка — оплата сразу, через Авито Доставку — при получении. Деталь из-за рубежа — предоплата 60% после подбора.',
    ],
    [
      'Как доставляете?',
      // условия доставки — пост клиента «Бонус» 2026-09-18 (D40 закрыт)
      'Отправляем в любую точку России — СДЭК, Яндекс Доставкой, ПЭК, Авито Доставкой или другой транспортной компанией. Небольшие детали до ПВЗ Яндекс Маркета везём за наш счёт: при заказе от 3 000 ₽ — до 300 ₽ доставки, от 10 000 ₽ — до 500 ₽. Крупные детали — по тарифу ТК, сумму назовём до оплаты. Самовывоз — Московская обл., г. Королёв, ул. Южная, 7а, ГСК «Берёзка».',
    ],
    [
      'Что если деталь не подошла или с браком?',
      'Деталь с браком заменим или вернём деньги. Совместимость проверяем по VIN до оплаты, а если ошиблись мы — тоже вернём деньги или заменим деталь.',
    ],
    [
      'Можно поставить деталь у вас?',
      'Да, в Gal service в Мизиново. На нашу деталь с установкой у нас — гарантия 2 недели. Вашу деталь тоже поставим, но без гарантии.',
    ],
    [
      'Нашли дешевле?',
      'Пришлите скриншот цены в Telegram — предложим вариант выгоднее.',
    ],
  ] as const
).map(([question, answer], i) => ({
  id: `faq-${i + 1}`,
  question,
  answer,
  sort: i + 1,
  status: published,
  is_demo: false,
}))

// Цифры — ответ 4; YouTube-канал @gal_auto (ссылка от Вани 2026-09-16)
export const stats: Stat[] = (
  [
    [4, null, 'года разбираем BMW', 'published'],
    [50, '+', 'машин разобрали', 'published'],
    [4000, '+', 'подписчиков на YouTube', 'published'],
  ] as const
).map(([value, suffix, label, status], i) => ({
  id: `stat-${i + 1}`,
  value,
  suffix,
  label,
  sort: i + 1,
  status,
  is_demo: false,
}))

export const site_settings: SiteSettings = {
  telegram_username: 'ikononov77',
  contact_name: 'Иван',
  contact_name_dative: 'Ивану',
  // Фото клиента получено 2026-09-16; показ согласован.
  ivan_photo: files.ivan,
  ivan_photo_consent: true,
  intro: 'Напишите VIN и какая деталь нужна — подберём её под вашу машину и назовём цену до оплаты. Ремонт и салон — тоже к нам.',
  intro_short: 'VIN и деталь — подберём и назовём цену.',
  // ответ 30: скорость ответа не указываем
  response_time: null,
  phone: '+79160033434',
  phone_calls: true,
  whatsapp: true,
  socials: [
    {
      id: 'instagram-parts',
      sort: 1,
      type: 'instagram',
      label: 'Instagram разбора',
      handle: 'gen_auto_lab',
      url: 'https://instagram.com/gen_auto_lab',
      show_in_custom: false,
    },
    {
      id: 'instagram-custom',
      sort: 2,
      type: 'instagram',
      label: 'Instagram ателье',
      handle: 'gal_custom',
      url: 'https://instagram.com/gal_custom',
      show_in_custom: true,
    },
    {
      id: 'telegram-channel',
      sort: 3,
      type: 'telegram_channel',
      label: 'Telegram-канал',
      handle: 'GenAutoLab',
      url: 'https://t.me/GenAutoLab',
      show_in_custom: false,
    },
    {
      id: 'youtube',
      sort: 4,
      type: 'youtube',
      label: 'YouTube',
      handle: 'gal_auto',
      url: 'https://youtube.com/@gal_auto',
      show_in_custom: false,
    },
  ],
  // [долг D29] почта появится после регистрации домена
  email: null,
  city_prepositional: 'в Подмосковье',
  locations: [
    {
      id: 'mizinovo',
      sort: 1,
      kind: 'workshop',
      name: 'Разбор и мастерская',
      city: 'Мизиново',
      city_prepositional: 'в Мизиново',
      address: 'Московская обл., Лосино-Петровский г. о., д. Мизиново, Орловский проезд, вл. 5',
      purpose: 'разбор, Gal service, Gal custom',
      hours: '12:00–00:00',
      visit_allowed: true,
      yandex_maps_url: 'https://yandex.ru/maps/-/CTx6fAM3',
      twogis_url: null,
      yandex_rating: 4.8,
    },
    {
      id: 'korolev',
      sort: 2,
      kind: 'pickup',
      name: 'Пункт выдачи',
      city: 'Королёв',
      city_prepositional: 'в Королёве',
      address: 'Московская обл., г. Королёв, ул. Южная, 7а, ГСК «Берёзка»',
      purpose: 'самовывоз, оплата на месте',
      hours: '12:00–00:00',
      visit_allowed: true,
      yandex_maps_url: null,
      twogis_url: null,
      yandex_rating: null,
    },
  ],
  timezone: 'Europe/Moscow',
  // Реквизиты подтверждены Ваней 2026-09-16; контрольные цифры ИНН сходятся
  legal_form: 'ИП',
  legal_name: 'Кононов Иван Сергеевич',
  inn: '773015489440',
  ogrn: null,
  parts_counter_value: 5000,
  parts_counter_suffix: '+',
  // что в наличии, а что под заказ — уточняется в Telegram, на сайте статуса нет
  parts_counter_label: 'деталей в наличии и под заказ',
  service_image: null,
  custom_banner: null,
}

export const demo: Seed = {
  part_sections,
  part_positions,
  bmw_bodies,
  services,
  works,
  faq,
  stats,
  site_settings,
}
