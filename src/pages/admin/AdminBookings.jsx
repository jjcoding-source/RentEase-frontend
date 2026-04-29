import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatINR } from '../../utils/formatCurrency'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosInstance'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const STATUS_BADGE = { Pending: 'amber', Confirmed: 'green', Rejected: 'red', Completed: 'blue' }
const CARD_GRADIENTS = [
  'from-blue-200 to-blue-600',
  'from-cyan-200 to-teal-500',
  'from-gray-200 to-gray-500',
  'from-violet-200 to-violet-600',
]
const FILTERS = ['All', 'Pending', 'Confirmed', 'Rejected', 'Completed']

export default function AdminBookings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin', 'all-bookings'],
    queryFn:  () => api.get('/admin/bookings').then(r => r.data),
  })

  const pendingCount   = bookings.filter(b => b.status === 'Pending').length
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length
  const rejectedCount  = bookings.filter(b => b.status === 'Rejected').length
  const completedCount = bookings.filter(b => b.status === 'Completed').length

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((s, b) => s + (b.rent || 0) * (b.duration || 0), 0)

  const filtered = bookings
    .filter(b => filter === 'All' || b.status === filter)
    .filter(b =>
      b.renterName?.toLowerCase().includes(search.toLowerCase()) ||
      b.propertyTitle?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="bg-[#f2f3ff] min-h-screen">

      {/* Navbar */}
      <nav className="bg-white border-b border-[#e6e7f4] px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-bold text-[#0053cc]">Estates</span>
          <span className="bg-[#fce7f3] text-[#be185d] text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
          <span className="text-[#d8d9e5] mx-1">|</span>
          <span className="text-[13px] text-[#64748b] font-medium">All Bookings</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-[12px] text-[#0053cc] font-semibold hover:underline">
            ← Dashboard
          </button>
          <div className="w-8 h-8 rounded-full bg-[#0053cc] text-white flex items-center justify-center text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <button onClick={() => { logout(); navigate('/auth') }} className="text-[12px] text-gray-400 hover:text-gray-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="px-6 py-6 max-w-7xl mx-auto">

        <div className="mb-5">
          <h1 className="text-[22px] font-bold text-[#191b24] tracking-tight">All bookings</h1>
          <p className="text-[13px] text-[#727787] mt-0.5">Platform-wide booking overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          <StatCard label="Total"     value={bookings.length} />
          <StatCard label="Pending"   value={pendingCount}   valueColor="text-amber-700" />
          <StatCard label="Confirmed" value={confirmedCount} valueColor="text-green-700" />
          <StatCard label="Rejected"  value={rejectedCount}  valueColor="text-red-700" />
          <StatCard label="Revenue"   value={formatINR(totalRevenue)} valueColor="text-[#0053cc]" />
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4] flex-wrap gap-2">
            <h2 className="text-[14px] font-bold text-[#191b24]">Booking records</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="flex items-center gap-2 bg-[#f2f3ff] border border-[#e6e7f4] rounded-lg px-3 py-1.5">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="#727787" strokeWidth="2"/>
                  <path d="m21 21-4-4" stroke="#727787" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  className="bg-transparent text-[12px] outline-none w-36 placeholder:text-gray-400"
                  placeholder="Search by renter or property..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Filters */}
              {FILTERS.map(f => (
                <button
                  key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    filter === f ? 'bg-[#0053cc] text-white' : 'text-[#727787] hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="py-10 text-center text-[13px] text-gray-400 animate-pulse">Loading bookings...</div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-[13px] text-gray-400">No bookings found.</div>
          )}

          {!isLoading && filtered.length > 0 && (
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-[#faf8ff]">
                  {['Property','Renter','Owner','Period','Rent/mo','Status'].map((h, i) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                      style={{ width: ['24%','16%','14%','18%','13%','15%'][i] }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-7 rounded bg-gradient-to-br ${CARD_GRADIENTS[i % 4]} flex-shrink-0`} />
                        <div>
                          <div className="text-[12px] font-semibold text-[#191b24] leading-snug truncate">{b.propertyTitle}</div>
                          <div className="text-[10px] text-[#727787]">{b.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[12px] font-medium text-[#191b24]">{b.renterName}</div>
                      <div className="text-[10px] text-[#94a3b8] truncate">{b.renterEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#424655]">{b.ownerName}</td>
                    <td className="px-4 py-3.5 text-[11px] text-[#64748b]">
                      {b.moveIn  ? new Date(b.moveIn).toLocaleDateString('en-IN',  { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      <br/>
                      {b.moveOut ? new Date(b.moveOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#0053cc]">
                      {b.rent ? formatINR(b.rent) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge label={b.status} variant={STATUS_BADGE[b.status] || 'gray'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}