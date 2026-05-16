import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy – The 1% Traders Hub',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">
            App Name: <span className="text-gray-300">The 1% Traders Hub</span>
          </p>
        </div>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Information We Collect">
            We may collect:
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Name, email, phone number</li>
              <li>Device information</li>
              <li>Usage data (app activity)</li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide and improve services</li>
              <li>To communicate updates and offers</li>
              <li>To enhance user experience</li>
            </ul>
          </Section>

          <Section title="3. Data Protection">
            We implement security measures to protect your data. However, no method is 100% secure.
          </Section>

          <Section title="4. Sharing of Information">
            We do <strong className="text-white">NOT</strong> sell user data. We may share data with:
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Service providers (hosting, analytics)</li>
              <li>Legal authorities if required</li>
            </ul>
          </Section>

          <Section title="5. Cookies & Tracking">
            We may use cookies or similar technologies to track usage.
          </Section>

          <Section title="6. User Rights">
            Users can:
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Request access to their data</li>
              <li>Request deletion of their data</li>
            </ul>
          </Section>

          <Section title="7. Third-Party Services">
            The app may use third-party services (e.g., payment gateways, analytics tools).
          </Section>

          <Section title="8. Children's Privacy">
            This app is not intended for users under 18 years of age.
          </Section>

          <Section title="9. Changes to Policy">
            We may update this policy from time to time.
          </Section>

          <Section title="10. Contact">
            Email:{' '}
            <a href="mailto:durgampooja94@gmail.com" className="text-brand-400 hover:text-brand-300 transition-colors">
              durgampooja94@gmail.com
            </a>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-dark-600 pb-8">
      <h2 className="text-white font-semibold text-base mb-3">{title}</h2>
      <div className="text-gray-400">{children}</div>
    </div>
  )
}
