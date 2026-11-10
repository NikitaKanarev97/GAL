/* Прайс Gal service — все услуги с поиском и группами. С главной сюда ведёт «Весь прайс» в блоке Gal service. */
import type { Metadata } from 'next'
import Link from 'next/link'
import { getServices, getSettings } from '@/data'
import { PriceCatalog } from '@/components/service/PriceCatalog'
import { LeadButton } from '@/components/contact/LeadButton'
import { HexBadge } from '@/components/icons/HexBadge'
import { Icon } from '@/components/icons/Icon'
import { SectionTitle } from '@/components/ui/SectionTitle'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const city = s.city_prepositional ? ` ${s.city_prepositional}` : ''
  return {
    title: `Цены на ремонт BMW${city} — прайс Gal service`,
    description: 'Прайс на ремонт BMW E36, E46, E90, E34, E39, E60, E32, E38, E65, X5 E53, X5 E70: ТО, двигатель, подвеска, тормоза, КПП. Цена за работу для вашего кузова.',
    alternates: { canonical: '/service' },
  }
}

export default async function ServicePage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()])
  const workshop = settings.locations.find((l) => l.kind === 'workshop')

  return (
    <div className={`container ${styles.page}`}>
      <Link href="/#service" className={styles.back}>
        <Icon name="arrowLeft" className={styles.backIcon} />
        Gal service
      </Link>

      <header className={styles.head}>
        <SectionTitle
          as="h1"
          id="price-title"
          eyebrow={`Ремонт BMW${workshop?.city_prepositional ? ` ${workshop.city_prepositional}` : ''}`}
          title="Прайс на ремонт"
        />
        <p className={`t-body ${styles.lead}`}>
          Цены за работу, без запчастей, — для вашего кузова. Точная зависит от мотора и комплектации: назовём её по VIN.
          Деталь подберём и привезём сами.
        </p>
        <p className={styles.badge}>
          <HexBadge name="warranty" />
          <span className="t-small">Гарантия 2 недели при установке нашей детали</span>
        </p>
      </header>

      {services.length > 0 ? (
        <PriceCatalog services={services} />
      ) : (
        <p className={`t-body ${styles.lead}`}>Прайс обновляется. Напишите, что с машиной, — назовём цену.</p>
      )}

      <aside className={styles.cta}>
        <div>
          <p className={styles.ctaTitle}>Не знаете, что сломалось?</p>
          <p className={`t-small ${styles.ctaText}`}>Опишите, как ведёт себя машина, и приложите кузов или VIN — подскажем, что делать.</p>
        </div>
        <LeadButton lead={{ topic: 'repair', source: 'прайс Gal service' }} size="lg" icon="telegram">
          Обсудить ремонт
        </LeadButton>
      </aside>
    </div>
  )
}
