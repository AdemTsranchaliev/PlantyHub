import { lazy, Suspense, useEffect, useState } from 'react'
import HeroSection from '../sections/HeroSection'
import { useSectionEnabled } from '../hooks/useHomepage'
import type { HomepageSectionKey } from '../admin/homepageSchema'

const HomeRest = lazy(() => import('./HomeRest'))

function SectionGate({ sectionKey, children }: { sectionKey: HomepageSectionKey; children: React.ReactNode }) {
  const enabled = useSectionEnabled(sectionKey)
  if (!enabled) return null
  return <>{children}</>
}

export default function HomePage() {
  const [showRest, setShowRest] = useState(false)

  useEffect(() => {
    const start = () => setShowRest(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 600 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(start, 1)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <main>
      <SectionGate sectionKey="hero">
        <HeroSection />
      </SectionGate>
      {showRest ? (
        <Suspense fallback={null}>
          <HomeRest />
        </Suspense>
      ) : null}
    </main>
  )
}
