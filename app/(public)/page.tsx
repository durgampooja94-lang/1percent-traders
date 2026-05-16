import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from './components/HeroSection'
import CoursesSection from './components/CoursesSection'
import AboutSection from './components/AboutSection'
import StatsSection from './components/StatsSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <CoursesSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
