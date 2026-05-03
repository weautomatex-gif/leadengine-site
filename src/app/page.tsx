import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import TrustBar from '@/components/sections/TrustBar'
import FeatureSections from '@/components/sections/FeatureSections'
import HowItWorks from '@/components/sections/HowItWorks'
import PricingSection from '@/components/sections/PricingSection'
import CtaSection from '@/components/sections/CtaSection'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeatureSections />
        <HowItWorks />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
