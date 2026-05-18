'use client'
import { useState } from 'react'
import Link from 'next/link'      
import { useAuth } from '@/hooks/useAuth'     
import { Menu, X, LogOut, LayoutDashboard, User, TrendingUp } from 'lucide-react'

function LogoMark() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-sm">1%</span>
      </div>
    )
  }
  return (
    <img src="/logo.JPG" alt="1%" className="w-9 h-9 object-contain flex-shrink-0 rounded-xl"
      onError={() => setErr(true)} />
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-white font-bold text-lg leading-none">1% Traders Hub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#courses" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Courses</Link>
            <Link href="/#about" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">About</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Contact</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-xl px-3 py-1.5 hover:border-brand-500/50 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-white font-medium hidden sm:block max-w-[80px] truncate">
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-dark-800 border border-dark-500 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-dark-700 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> My Courses
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-brand-400 hover:text-brand-300 hover:bg-dark-700 transition-colors">
                        <TrendingUp className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-dark-600" />
                    <button onClick={() => { logout(); setProfileOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/dashboard"
                className="bg-brand-gradient text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/25">
                Get Started
              </Link>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 py-4 space-y-2">
          {[['Courses', '/#courses'], ['About', '/#about'], ['Contact', '/contact']].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-dark-700 rounded-xl transition-colors text-sm font-medium">
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
