'use client'
// app/(admin)/admin/users/page.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Search, Users, Phone, Calendar, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  phone: string
  email?: string
  role: string
  createdAt: any
  purchaseCount: number
}

export default function AdminUsersPage() {
  const { getToken } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filtered, setFiltered] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'purchaseCount'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = await getToken()
        const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setUsers(data.users || [])
        setFiltered(data.users || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    let result = [...users]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      if (sortBy === 'purchaseCount') {
        return sortDir === 'desc' ? b.purchaseCount - a.purchaseCount : a.purchaseCount - b.purchaseCount
      }
      return 0
    })
    setFiltered(result)
  }, [search, users, sortBy, sortDir])

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 inline-flex flex-col -space-y-1">
      <ChevronUp className={`w-2.5 h-2.5 ${sortBy === col && sortDir === 'asc' ? 'text-brand-400' : 'text-gray-600'}`} />
      <ChevronDown className={`w-2.5 h-2.5 ${sortBy === col && sortDir === 'desc' ? 'text-brand-400' : 'text-gray-600'}`} />
    </span>
  )

  // Summary stats
  const totalPaying = users.filter(u => u.purchaseCount > 0).length
  const convRate = users.length > 0 ? Math.round((totalPaying / users.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Users</h1>
          <p className="text-gray-400 text-sm">{users.length} registered users</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15' },
          { label: 'Paying Users', value: totalPaying, icon: ShoppingBag, color: 'text-green-400', bg: 'bg-green-500/15' },
          { label: 'Conversion Rate', value: `${convRate}%`, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-dark-800 border border-dark-500 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{loading ? '—' : value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full bg-dark-800 border border-dark-500 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700/60 border-b border-dark-600">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => toggleSort('purchaseCount')}>
                  <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Purchases <SortIcon col="purchaseCount" /></span>
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => toggleSort('createdAt')}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined <SortIcon col="createdAt" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-500 text-sm">No users found</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-dark-700/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{user.name || 'No name'}</p>
                        {user.email && <p className="text-gray-500 text-xs">{user.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-gray-300">{user.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.role === 'admin'
                        ? 'bg-brand-500/15 text-brand-400'
                        : 'bg-dark-600 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${user.purchaseCount > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                      {user.purchaseCount}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {user.createdAt?.toDate
                      ? user.createdAt.toDate().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-700 flex items-center justify-between">
          <p className="text-gray-500 text-xs">Showing {filtered.length} of {users.length} users</p>
          <button
            onClick={() => {
              const csv = ['Name,Phone,Email,Role,Purchases,Joined',
                ...filtered.map(u => `${u.name},${u.phone},${u.email || ''},${u.role},${u.purchaseCount},${u.createdAt?.toDate?.()?.toLocaleDateString() || ''}`)
              ].join('\n')
              const a = document.createElement('a')
              a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
              a.download = 'users.csv'
              a.click()
            }}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
