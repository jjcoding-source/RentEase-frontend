import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { useOwnerBookings, useUpdateBookingStatus } from '../../hooks/useBookings'
import { formatINR } from '../../utils/formatCurrency'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const FILTERS = ['All', 'Pending', 'Confirmed', 'Rejected']

const STATUS_BADGE = {
  Pending:   'amber',
  Confirmed: 'green',
  Rejected:  'red',
}

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
  'from-indigo-200 to-blue-700',
]

const BORDER_STATUS = {
  Pending:   'border-l-[#f4a82a]',
  Confirmed: 'border-l-[#1a6b32]',
  Rejected:  'border-l-[#ba1a1a]',
}

export default function BookingRequests() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [expandedId, setExpandedId]     = useState(null)

  const { data: bookings = [], isLoading, isError } = useOwnerBookings()
  const { mutateAsync: updateStatus, isPending }     = useUpdateBookingStatus()

  const pendingCount   = bookings.filter(b => b.status === 'Pending').length
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length
  const rejectedCount  = bookings.filter(b => b.status === 'Rejected').length

  const filtered = activeFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeFilter)

  async function handleStatus(id, status) {
    try {
      await updateStatus({ id, status })
    } catch {
      alert('Failed to update booking status.')
    }
  }

  return (
    <PageWrapper pendingBookings={pendingCount}>

      {/* ── Top bar ── */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[#191b24] tracking-tight">Booking requests</h1>
        <p className="text-[13px] text-[#727787] mt-0.5">Review and respond to tenant booking requests</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Pending review"  value={pendingCount}            valueColor="text-amber-700" />
        <StatCard label="Confirmed"       value={confirmedCount}          valueColor="text-green-700" />
        <StatCard label="Rejected"        value={rejectedCount}           valueColor="text-red-700" />
        <StatCard label="Total requests"  value={bookings.length} />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1.5 mb-4">
        {FILTERS.map(f => {
          const count =
            f === 'All'       ? bookings.length :
            f === 'Pending'   ? pendingCount :
            f === 'Confirmed' ? confirmedCount :
            rejectedCount
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors ${
                activeFilter === f
                  ? 'bg-[#0053cc] text-white border-[#0053cc]'
                  : 'bg-white text-[#727787] border-[#e6e7f4] hover:bg-gray-50'
              }`}
            >
              {f} ({count})
            </button>
          )
        })}
      </div>

      {/* ── States ── */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#e6e7f4] rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          Failed to load booking requests.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-[13px] text-gray-400 font-medium">No {activeFilter.toLowerCase()} requests found.</div>
        </div>
      )}

      {/* ── Booking cards ── */}
      {!isLoading && !isError && (
        <div className="flex flex-col gap-3">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              className={`bg-white border border-[#e6e7f4] border-l-4 rounded-xl p-[18px] grid gap-4 ${BORDER_STATUS[b.status] || ''}`}
              style={{ gridTemplateColumns: 'auto 1fr auto' }}
            >
              {/* Thumbnail */}
              <div className={`w-[60px] h-[50px] rounded-lg bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex-shrink-0`} />

              {/* Body */}
              <div>
                <div className="text-[13px] font-bold text-[#191b24] mb-0.5">{b.propertyTitle} — {b.city}</div>
                <div className="text-[12px] text-[#727787] mb-2">
                  {b.status} · {formatINR(b.rent)}/mo
                </div>

                {/* Renter info */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: '#0053cc' }}
                  >
                    {b.renterName?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#191b24]">{b.renterName}</div>
                    <div className="text-[11px] text-[#727787]">
                      {b.renterEmail} · ⭐ {b.renterScore || '—'} renter score
                    </div>
                  </div>
                </div>

                {/* Details row */}
                <div className="flex gap-4 flex-wrap">
                  <Detail label="Move-in"  value={b.moveIn  ? new Date(b.moveIn).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'} />
                  <Detail label="Duration" value={`${b.duration} months`} />
                  <Detail label="Tenants"  value={b.occupants || '—'} />
                  {b.message && (
                    <Detail label="Message" value={`"${b.message.slice(0, 40)}..."`} />
                  )}
                </div>

                {/* Expandable full message */}
                {b.message && b.message.length > 40 && (
                  <button
                    onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    className="text-[11px] text-[#0053cc] font-semibold mt-1.5 hover:underline"
                  >
                    {expandedId === b.id ? 'Show less ↑' : 'Read full message ↓'}
                  </button>
                )}
                {expandedId === b.id && (
                  <div className="mt-2 bg-[#f2f3ff] rounded-lg px-3 py-2 text-[12px] text-[#424655] leading-relaxed">
                    {b.message}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-1.5">
                <Badge label={b.status} variant={STATUS_BADGE[b.status]} />

                {b.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, 'Confirmed')}
                      disabled={isPending}
                      className="bg-[#1a6b32] text-white border-none px-3.5 py-1.5 rounded-md text-[12px] font-bold hover:bg-green-800 disabled:opacity-60 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, 'Rejected')}
                      disabled={isPending}
                      className="bg-white text-red-700 border border-red-200 px-3.5 py-1.5 rounded-md text-[12px] font-bold hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status === 'Confirmed' && (
                  <button className="bg-white text-[#424655] border border-[#e6e7f4] px-3.5 py-1.5 rounded-md text-[12px] font-semibold hover:bg-gray-50 transition-colors">
                    View contract
                  </button>
                )}

                <button className="bg-white text-[#424655] border border-[#e6e7f4] px-3.5 py-1.5 rounded-md text-[12px] font-semibold hover:bg-gray-50 transition-colors">
                  Message
                </button>

                <div className="text-[10px] text-[#727787] mt-1 text-right">
                  {b.createdAt
                    ? `Received ${timeAgo(b.createdAt)}`
                    : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

// ── Helpers ──
function Detail({ label, value }) {
  return (
    <div className="text-[11px] text-[#424655]">
      <strong className="text-[#191b24] font-semibold">{label}:</strong> {value}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hrs   = Math.floor(mins / 60)
  const days  = Math.floor(hrs / 24)
  if (days > 0)  return `${days} day${days > 1 ? 's' : ''} ago`
  if (hrs > 0)   return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  return `${mins} min ago`
}