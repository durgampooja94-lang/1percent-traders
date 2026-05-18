import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MessageCircle, Mail, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Contact Us – The 1% Traders Hub',
}

const WHATSAPP_NUMBER = '917032174426'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
const CONTACT_EMAIL = 'durgampooja94@gmail.com'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-gray-400">
            Have a question or need support? Reach out to us — we're happy to help.
          </p>
        </div>

        <div className="space-y-4">
          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 bg-dark-800 border border-dark-500 hover:border-green-500/50 rounded-2xl p-6 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="w-7 h-7 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base">WhatsApp</p>
              <p className="text-gray-400 text-sm mt-0.5">+91 70321 74426</p>
              <p className="text-gray-500 text-xs mt-1">Chat with us directly on WhatsApp</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors shrink-0" />
          </a>

          {/* Email */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-5 bg-dark-800 border border-dark-500 hover:border-brand-500/50 rounded-2xl p-6 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 group-hover:bg-brand-500/20 transition-colors">
              <Mail className="w-7 h-7 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base">Email</p>
              <p className="text-gray-400 text-sm mt-0.5">{CONTACT_EMAIL}</p>
              <p className="text-gray-500 text-xs mt-1">Send us an email anytime</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand-400 transition-colors shrink-0" />
          </a>
        </div>

        {/* WhatsApp CTA Button */}
        <div className="mt-10 text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-green-500/25 text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
