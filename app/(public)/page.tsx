import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from './components/HeroSection'
import CoursesSection from './components/CoursesSection'
import AboutSection from './components/AboutSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CoursesSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
