import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms and Conditions – The 1% Traders Hub',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-400 text-sm">
            App Name: <span className="text-gray-300">The 1% Traders Hub</span> &nbsp;|&nbsp; Company:{' '}
            <span className="text-gray-300">The 1% Traders Hub</span>
          </p>
        </div>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <Section title="1. Introduction">
            Welcome to 1% Trader. By accessing or using our application, you agree to be bound
            by these Terms and Conditions.
          </Section>

          <Section title="2. Nature of Services">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>This platform provides educational content, market analysis, and trading insights.</li>
              <li>We do <strong className="text-white">NOT</strong> provide investment advice, portfolio management, or guaranteed returns.</li>
            </ul>
          </Section>

          <Section title="3. No Investment Advice Disclaimer">
            All content is for educational and informational purposes only. Users must consult a
            SEBI-registered financial advisor before making investment decisions.
          </Section>

          <Section title="4. User Responsibility">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Users are fully responsible for their trading decisions.</li>
              <li>The company is not liable for any profits or losses.</li>
            </ul>
          </Section>

          <Section title="5. Risk Disclosure">
            Trading in financial markets involves high risk, including potential loss of capital.
            Past performance does not guarantee future results.
          </Section>

          <Section title="6. Account Usage">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Users must provide accurate information.</li>
              <li>Sharing login credentials is strictly prohibited.</li>
            </ul>
          </Section>

          <Section title="7. Payments & Refunds">
            All payments made are non-refundable unless otherwise stated.
          </Section>

          <Section title="8. Intellectual Property">
            All content (videos, strategies, materials) is owned by 1% Trader. Unauthorized
            distribution is strictly prohibited.
          </Section>

          <Section title="9. Limitation of Liability">
            We are not liable for:
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Trading losses</li>
              <li>Technical issues</li>
              <li>Market fluctuations</li>
            </ul>
          </Section>

          <Section title="10. Termination">
            We reserve the right to suspend or terminate accounts violating these terms.
          </Section>

          <Section title="11. Governing Law">
            These terms are governed by the laws of India.
          </Section>

          <Section title="12. Contact Information">
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
