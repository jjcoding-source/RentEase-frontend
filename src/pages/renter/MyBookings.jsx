import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useMyBookings } from '../../hooks/useBookings'
import { formatINR } from '../../utils/formatCurrency'

const STATUS_STYLE = {
  Confirmed: 'bg-[#dcfce7] text-[#15803d]',
  Pending:   'bg-[#fef9c3] text-[#b45309]',
  Rejected:  'bg-[#fee2e2] text-[#b91c1c]',
  Completed: 'bg-[#f1f5f9] text-[#475569]',
}

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-600',
  'from-pink-200 to-pink-600',
  'from-green-200 to-green-600',
  'from-violet-200 to-violet-600',
]

const FILTERS = ['All', 'Confirmed', 'Pending', 'Rejected', 'Completed']

export default function MyBookings() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const { data: bookings = [], isLoading } = useMyBookings()

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter)

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'All' ? bookings.length : bookings.filter(b => b.status === f).length
    return acc
  }, {})

  return (
    <PageWrapper pendingBookings={bookings.filter(b => b.status === 'Pending').length}>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[17px] font-bold text-[#0f172a]">My bookings</h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">Track all your rental requests and active stays</p>
        </div>
        <button
          onClick={() => navigate('/properties')}
          className="bg-[#1558c0] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#1248a8] transition-colors"
        >
          + Find a home
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              filter === f
                ? 'bg-[#1558c0] text-white border-[#1558c0]'
                : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-gray-50'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-[13px] text-gray-400 font-medium">No {filter.toLowerCase()} bookings found.</div>
          <button
            onClick={() => navigate('/properties')}
            className="mt-2 text-[12px] text-[#1558c0] font-semibold hover:underline"
          >
            Browse properties →
          </button>
        </div>
      )}

      {/* Booking cards */}
      {!isLoading && (
        <div className="flex flex-col gap-3">
          {filtered.map((b, i) => (
            <div key={b.id} className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex gap-3 items-start">

              {/* Property thumb */}
              <div className={`w-16 h-14 rounded-lg bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex-shrink-0`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#1e293b] mb-0.5">{b.propertyTitle}</div>
                <div className="text-[11px] text-[#94a3b8] mb-1.5">
                  {b.city} ·{' '}
                  {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  {' – '}
                  {b.moveOut ? new Date(b.moveOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[b.status] || ''}`}>
                    {b.status}
                  </span>
                  {b.duration && (
                    <span className="text-[11px] text-[#64748b]">{b.duration} months</span>
                  )}
                  {b.occupants && (
                    <span className="text-[11px] text-[#64748b]">· {b.occupants}</span>
                  )}
                </div>
              </div>

              {/* Price + actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-[14px] font-bold text-[#1558c0]">
                  {b.rent ? formatINR(b.rent) : '—'}<span className="text-[11px] font-normal text-[#94a3b8]">/mo</span>
                </div>
                <button
                  onClick={() => navigate(`/properties/${b.propertyId}`)}
                  className="border border-[#e2e8f0] rounded-md px-2.5 py-1 text-[11px] font-semibold text-[#64748b] hover:bg-gray-50 transition-colors"
                >
                  View property
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}