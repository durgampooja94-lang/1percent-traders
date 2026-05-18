'use client'
// app/(public)/components/FaqSection.tsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

const faqs = [
  { q: 'Who is this course for?', a: 'This course is for anyone who wants to learn stock market trading seriously — from complete beginners with zero knowledge to intermediate traders who want to level up their strategies.' },
  { q: 'Do I need prior trading experience?', a: 'No. The Foundation course starts from absolute zero and builds up systematically. By the end you will be confident reading charts, identifying setups, and managing risk.' },
  { q: 'Will I get lifetime access?', a: 'Yes. Once you purchase a course, you get lifetime access to all videos, including any future content updates added to that course — at no additional cost.' },
  { q: 'How is this different from YouTube videos?', a: 'YouTube videos are fragmented and unstructured. Our courses follow a logical progression, include real trade breakdowns with actual P&L, and come with community access and mentorship — things YouTube cannot offer.' },
  { q: 'What is the refund policy?', a: 'We offer a 7-day no-questions-asked refund if you are not satisfied. Just email us within 7 days of purchase. After 7 days, due to the digital nature of the content, refunds are not available.' },
  { q: 'How do I access the videos after purchase?', a: 'After payment confirmation, your account is instantly unlocked. Log in at 1percenttraders.in and go to your dashboard — all purchased courses are immediately available to watch.' },
  { q: 'Is the content in Hindi or English?', a: 'Both. All courses are explained in a comfortable Hindi-English mix (Hinglish) that is easy to follow for Indian learners, with text overlays and slides in English.' },
  { q: 'Can I watch on my phone?', a: 'Yes. The platform works on all devices — desktop, tablet, and mobile. You can also install it as an app on your phone home screen (it is a PWA — no Play Store needed).' },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-max max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden hover:border-brand-500/30 transition-colors">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-white font-medium text-sm sm:text-base pr-4">{faq.q}</span>
                <ChevronDown className={clsx('w-5 h-5 text-gray-400 flex-shrink-0 transition-transform', open === i && 'rotate-180 text-brand-400')} />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <div className="border-t border-dark-600 pt-4">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-dark-800 border border-brand-500/20 rounded-2xl p-8">
          <h3 className="text-white font-bold text-xl mb-2">Still have questions?</h3>
          <p className="text-gray-400 text-sm mb-6">Reach out to us on WhatsApp and we'll get back to you within minutes.</p>
          <a href="https://wa.me/917032174426" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
