import HeroSection from '../sections/HeroSection'
import GrowSmarterSection from '../sections/GrowSmarterSection'
import ProductSection from '../sections/ProductSection'
import HowItWorksSection from '../sections/HowItWorksSection'
import LightCycleSection from '../sections/LightCycleSection'
import PodsGridSection from '../sections/PodsGridSection'
import SocialProofSection from '../sections/SocialProofSection'
import GuaranteesSection from '../sections/GuaranteesSection'
import AccessoriesSection from '../sections/AccessoriesSection'
import CtaSection from '../sections/CtaSection'
import { useSectionEnabled } from '../hooks/useHomepage'
import type { HomepageSectionKey } from '../admin/homepageSchema'

const sections: { key: HomepageSectionKey; Component: React.ComponentType }[] = [
  { key: 'hero', Component: HeroSection },
  { key: 'growSmarter', Component: GrowSmarterSection },
  { key: 'product', Component: ProductSection },
  { key: 'howItWorks', Component: HowItWorksSection },
  { key: 'lightCycle', Component: LightCycleSection },
  { key: 'podsGrid', Component: PodsGridSection },
  { key: 'socialProof', Component: SocialProofSection },
  { key: 'guarantees', Component: GuaranteesSection },
  { key: 'accessories', Component: AccessoriesSection },
  { key: 'cta', Component: CtaSection },
]

function SectionGate({ sectionKey, children }: { sectionKey: HomepageSectionKey; children: React.ReactNode }) {
  const enabled = useSectionEnabled(sectionKey)
  if (!enabled) return null
  return <>{children}</>
}

export default function HomePage() {
  return (
    <main>
      {sections.map(({ key, Component }) => (
        <SectionGate key={key} sectionKey={key}>
          <Component />
        </SectionGate>
      ))}
    </main>
  )
}
