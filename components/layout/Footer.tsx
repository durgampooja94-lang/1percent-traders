'use client'
import Link from 'next/link'
import { Instagram, Youtube, Twitter, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.JPG" alt="1%" className="w-10 h-10 object-contain flex-shrink-0 rounded-xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="text-white font-bold text-lg leading-none">1% Traders Hub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Master SMC Concepts, Liquidity, ICT concepts & Risk management with India's most comprehensive stock market course.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.instagram.com/pooja_trading_diary?igsh=MXYwNjFjbTZndHM5MA==" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/50 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@poojatradingdiary?si=VkAb_MfywVCYn3aT" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/50 transition-all">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://x.com/ppreciouspooja" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="tel:+917032174426"
                className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-500 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/50 transition-all">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5">
              {[['Courses', '/#courses'], ['About', '/#about'], ['Dashboard', '/dashboard'], ['Contact', '/contact']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Contact Us', '/contact']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <p className="text-gray-500 text-xs">Contact:</p>
              <a href="tel:+917032174426" className="text-brand-400 text-sm font-medium hover:text-brand-300">+91 70321 74426</a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-600 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">© 2026 1% Traders Hub. All rights reserved.</p>
          <p className="text-gray-500 text-xs">Trading involves risk. Learn responsibly.</p>
        </div>
      </div>
    </footer>
  )
}
