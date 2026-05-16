'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TrendingUp, Users, BookOpen, Receipt, IndianRupee } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  revenueToday: number
  recentOrders: any[]
  chartData: { day: string; revenue: number }[]
}

function buildWeeklyChart(orders: any[]): { day: string; revenue: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const revenue = orders
      .filter((o: any) => {
        if (o.status !== 'paid') return false
        const ts = o.createdAt
        const date = ts?._seconds
          ? new Date(ts._seconds * 1000)
          : ts?.toDate?.() ?? new Date(ts)
        return date >= d && date < next
      })
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0)
    result.push({ day: days[d.getDay()], revenue })
  }
  return result
}

export default function AdminOverviewPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalUsers: 0, totalOrders: 0, revenueToday: 0,
    recentOrders: [], chartData: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getToken()
        const [ordersRes, usersRes] = await Promise.all([
          fetch('/api/admin/orders?limit=100', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const ordersData = await ordersRes.json()
        const usersData = await usersRes.json()
        const allOrders = ordersData.orders || []
        setStats({
          totalRevenue: ordersData.stats?.totalRevenue || 0,
          revenueToday: ordersData.stats?.revenueToday || 0,
          totalOrders: allOrders.filter((o: any) => o.status === 'paid').length,
          totalUsers: usersData.users?.length || 0,
          recentOrders: allOrders.slice(0, 5),
          chartData: buildWeeklyChart(allOrders),
        })
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      sub: `₹${stats.revenueToday.toLocaleString('en-IN')} today`,
      icon: IndianRupee,
      color: 'from-brand-500/20 to-brand-600/5',
      iconColor: 'text-brand-400',
      iconBg: 'bg-brand-500/15',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      sub: 'Registered accounts',
      icon: Users,
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      sub: 'Paid transactions',
      icon: Receipt,
      color: 'from-green-500/20 to-green-600/5',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/15',
    },
    {
      label: 'Conversion Rate',
      value: stats.totalUsers > 0 ? `${Math.round((stats.totalOrders / stats.totalUsers) * 100)}%` : '0%',
      sub: 'Users to buyers',
      icon: TrendingUp,
      color: 'from-gold-500/20 to-gold-600/5',
      iconColor: 'text-gold-400',
      iconBg: 'bg-gold-500/15',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm">Welcome back. Here's what's happening with 1% Traders.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ label, value, sub, icon: Icon, color, iconColor, iconBg }) => (
          <div key={label} className={`relative bg-gradient-to-br ${color} border border-dark-500 rounded-2xl p-5 overflow-hidden`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{loading ? '—' : value}</div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">Revenue — Last 7 Days</h2>
            <p className="text-gray-400 text-sm mt-0.5">Daily revenue in ₹</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#22222F" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1A1A24', border: '1px solid #2E2E3E', borderRadius: '12px', color: '#fff' }}
              formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5}
              fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#F97316' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Recent Orders</h2>
          <a href="/admin/orders" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700/50">
              <tr>
                {['Order ID', 'User', 'Amount', 'Courses', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No orders yet</td></tr>
              ) : stats.recentOrders.map((order: any) => {
                const ts = order.createdAt
                const date = ts?._seconds
                  ? new Date(ts._seconds * 1000)
                  : ts?.toDate?.() ?? new Date(ts)
                return (
                  <tr key={order.id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-gray-400">
                      {order.razorpayOrderId?.slice(-10) || order.id?.slice(0, 10)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{order.userName || order.userId?.slice(0, 12) + '…'}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">₹{(order.amount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{order.courseIds?.length || 0} course(s)</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'paid' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {date ? date.toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
