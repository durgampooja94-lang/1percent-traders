'use client'
// app/(admin)/admin/orders/page.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Search, Download, Receipt, IndianRupee, CheckCircle, XCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface Order {
  id: string
  userId: string
  courseIds: string[]
  amount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  status: 'paid' | 'failed' | 'created' | 'refunded'
  createdAt: any
}

export default function AdminOrdersPage() {
  const { getToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [revenueToday, setRevenueToday] = useState(0)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = await getToken()
        const res = await fetch('/api/admin/orders?limit=500', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setOrders(data.orders || [])
        setFiltered(data.orders || [])
        setTotalRevenue(data.stats?.totalRevenue || 0)
        setRevenueToday(data.stats?.revenueToday || 0)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    let result = [...orders]
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.razorpayOrderId?.toLowerCase().includes(q) ||
        o.razorpayPaymentId?.toLowerCase().includes(q) ||
        o.userId?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, orders])

  const exportCSV = () => {
    const csv = [
      'Order ID,User ID,Amount,Razorpay Order ID,Payment ID,Status,Date',
      ...filtered.map(o =>
        `${o.id},${o.userId},${o.amount},${o.razorpayOrderId},${o.razorpayPaymentId || ''},${o.status},${o.createdAt?.toDate?.()?.toLocaleDateString() || ''}`
      )
    ].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const statusColors: Record<string, string> = {
    paid: 'bg-green-500/15 text-green-400',
    failed: 'bg-red-500/15 text-red-400',
    created: 'bg-yellow-500/15 text-yellow-400',
    refunded: 'bg-gray-500/15 text-gray-400',
  }

  const paidOrders = orders.filter(o => o.status === 'paid')
  const avgOrderValue = paidOrders.length > 0
    ? Math.round(paidOrders.reduce((s, o) => s + o.amount, 0) / paidOrders.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total transactions</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-dark-700 border border-dark-500 text-gray-300 hover:text-white hover:border-brand-500/50 text-sm font-medium px-4 py-2.5 rounded-xl transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-brand-400', bg: 'bg-brand-500/15' },
          { label: 'Revenue Today', value: `₹${revenueToday.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/15' },
          { label: 'Paid Orders', value: paidOrders.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/15' },
          { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString()}`, icon: Receipt, color: 'text-gold-400', bg: 'bg-gold-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-xl font-black text-white">{loading ? '—' : value}</div>
              <div className="text-gray-400 text-xs">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, payment ID or user ID..."
            className="w-full bg-dark-800 border border-dark-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'failed', 'refunded'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize',
                statusFilter === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-800 border border-dark-500 text-gray-400 hover:text-white hover:border-brand-500/50'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700/60 border-b border-dark-600">
              <tr>
                {['Razorpay Order', 'Payment ID', 'User ID', 'Courses', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500 text-sm">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-dark-700/40 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {order.razorpayOrderId?.slice(-14) || '—'}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {order.razorpayPaymentId?.slice(-12) || '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {order.userId?.slice(0, 16)}…
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300 text-center">
                    {order.courseIds?.length || 0}
                  </td>
                  <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                    ₹{(order.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || statusColors.created}`}>
                      {order.status === 'paid'
                        ? <CheckCircle className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-700">
          <p className="text-gray-500 text-xs">Showing {filtered.length} of {orders.length} orders</p>
        </div>
      </div>
    </div>
  )
}
