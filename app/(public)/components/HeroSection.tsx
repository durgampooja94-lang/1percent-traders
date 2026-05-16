'use client'
import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart2, Shield } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-600/6 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay:'1.5s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize:'80px 80px'}} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6 animate-fade-up delay-100">
          Join the{' '}
          <span className="relative">
            <span className="gradient-text">Top 1%</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
              <path d="M2 8C50 4 100 2 150 5C200 8 250 10 298 6" stroke="#C9A84C" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </span>
          <br />of Stock Market Traders
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
          Master SMC (Smart Money Concepts), Liquidity Concepts, ICT Concepts, Risk Management & Journaling with India's most comprehensive stock market course. Learn from those who live and breathe the markets.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-up delay-300">
          <Link href="/dashboard"
            className="group inline-flex items-center gap-2 bg-brand-gradient text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-brand-500/25">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/#courses"
            className="group inline-flex items-center gap-3 bg-dark-700/60 border border-dark-400 text-white font-semibold px-8 py-4 rounded-2xl hover:border-brand-500/50 hover:bg-dark-600 transition-all backdrop-blur-sm">
            View Courses
          </Link>
        </div>

        {/* Features row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 animate-fade-up delay-400">
          {[
            { icon: TrendingUp, text: 'SMC & ICT Concepts' },
            { icon: BarChart2, text: 'Risk Management' },
            { icon: Shield, text: 'NISM Certified Professionals' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-gray-400 text-sm">
              <Icon className="w-4 h-4 text-brand-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
