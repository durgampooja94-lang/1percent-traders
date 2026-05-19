'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LayoutDashboard, BookOpen, User, LogOut, TrendingUp, Menu } from 'lucide-react'
import { clsx } from 'clsx'

function SidebarLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
        <span className="text-white font-black text-xs">1%</span>
      </div>
    )
  }
  return (
    <img src="/logo.JPG" alt="1%" className="w-8 h-8 object-contain flex-shrink-0 rounded-lg"
      onError={() => setErr(true)} />
  )
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-dark-600">
          <SidebarLogo />
          <span className="text-white font-bold text-sm leading-none">1% Traders Hub</span>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.name || 'Trader'}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email || user?.phone || ''}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
          {user?.role === 'admin' && (
            <Link href="/admin" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-400 hover:bg-dark-700 transition-all">
              <TrendingUp className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-dark-600">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-dark-700 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-dark-800 border-b border-dark-600 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">1% Traders Hub</span>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
