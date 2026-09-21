import { getBodies, getFaq, getSections, getServices, getSettings, getStats, getWorks } from '@/data'
import { Hero } from '@/components/blocks/Hero'
import { Directions } from '@/components/blocks/Directions'
import { Models } from '@/components/blocks/Models'
import { Parts } from '@/components/blocks/Parts'
import { HowToOrder } from '@/components/blocks/HowToOrder'
import { Why } from '@/components/blocks/Why'
import { Service } from '@/components/blocks/Service'
import { Custom } from '@/components/blocks/Custom'
import { Faq } from '@/components/blocks/Faq'
import { Contacts } from '@/components/blocks/Contacts'
import { FloatingCta } from '@/components/blocks/FloatingCta'
import { Marquee } from '@/components/blocks/Marquee'
import { PageMotion } from '@/components/motion/PageMotion'

/* Порядок блоков — structure.md §2 */
export default async function HomePage() {
  const [settings, bodies, sections, services, serviceWorks, customWorks, faq, stats] = await Promise.all([
    getSettings(),
    getBodies(),
    getSections(),
    getServices(),
    getWorks('service'),
    getWorks('custom'),
    getFaq(),
    getStats(),
  ])
  const counter = settings.parts_counter_value
    ? `${settings.parts_counter_value}${settings.parts_counter_suffix ?? ''}`
    : null

  return (
    <>
      <Hero />
      <Directions sectionsCount={sections.length} counter={counter} />
      {bodies.length > 0 ? <Models /> : null}
      <Parts sections={sections} settings={settings} />
      <Marquee bodies={bodies.map((b) => b.code)} />
      <HowToOrder pickup={settings.locations.find((l) => l.kind === 'pickup') ?? null} />
      <Why stats={stats} counter={counter} />
      <Service services={services} works={serviceWorks} settings={settings} />
      <Custom works={customWorks} settings={settings} />
      {faq.length > 0 ? <Faq items={faq} /> : null}
      <Contacts settings={settings} />
      <FloatingCta />
      <PageMotion />
    </>
  )
}
