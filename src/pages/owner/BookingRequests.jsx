import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { useOwnerBookings, useUpdateBookingStatus } from '../../hooks/useBookings'
import { useToast } from '../../components/ui/Toast'
import { formatINR } from '../../utils/formatCurrency'

const FILTERS = ['All', 'Pending', 'Confirmed', 'Rejected']

const CARD_BORDER = {
  Pending:   'border-l-[#f4a82a]',
  Confirmed: 'border-l-[#1a6b32]',
  Rejected:  'border-l-[#ba1a1a]',
}

const CHIP_STYLE = {
  Pending:   'bg-[#fff3cd] text-[#854f0b]',
  Confirmed: 'bg-[#e1f5e8] text-[#1a6b32]',
  Rejected:  'bg-[#ffdad6] text-[#93000a]',
}

const GRADIENTS = [
  'linear-gradient(135deg,#b5d4f4,#185fa5)',
  'linear-gradient(135deg,#adecff,#00687a)',
  'linear-gradient(135deg,#dce3eb,#3d444b)',
  'linear-gradient(135deg,#dae2ff,#0053cc)',
]

const RENTER_COLORS = ['#0053cc','#00687a','#3d444b','#a43700','#1a6b32','#854f0b']

export default function BookingRequests() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [expandedId,   setExpandedId]   = useState(null)

  const { data: bookings = [], isLoading, isError } = useOwnerBookings()
  const { mutateAsync: updateStatus, isPending }   = useUpdateBookingStatus()

  // Toast Hook
  const { toast } = useToast()

  const pendingCount   = bookings.filter(b => b.status === 'Pending').length
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length
  const rejectedCount  = bookings.filter(b => b.status === 'Rejected').length

  const filtered = activeFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeFilter)

  // Updated handler with Toast notifications
  async function handleStatus(id, status) {
    try {
      await updateStatus({ id, status })

      toast({
        message: status === 'Confirmed'
          ? 'Booking approved successfully ✅'
          : 'Booking rejected.',
        type: status === 'Confirmed' ? 'success' : 'warning',
      })
    } catch (err) {
      toast({
        message: 'Failed to update booking status. Please try again.',
        type: 'error'
      })
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
        <StatCard label="Pending review"  value={pendingCount}   valueClass="text-[#854f0b]" />
        <StatCard label="Confirmed"       value={confirmedCount} valueClass="text-[#1a6b32]" />
        <StatCard label="Rejected"        value={rejectedCount}  valueClass="text-[#93000a]" />
        <StatCard label="Total requests"  value={bookings.length} valueClass="text-[#191b24]" />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1.5 mb-4">
        {FILTERS.map(f => {
          const count =
            f === 'All'       ? bookings.length :
            f === 'Pending'   ? pendingCount    :
            f === 'Confirmed' ? confirmedCount  :
            rejectedCount

          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-[7px] rounded-lg text-[12px] font-semibold border transition-colors ${
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

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-[#e6e7f4] rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">
          Failed to load booking requests.
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-[13px] text-gray-400 font-medium">
            No {activeFilter.toLowerCase()} requests found.
          </div>
        </div>
      )}

      {/* ── Booking Cards ── */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((b, i) => (
            <div
              key={b.id}
              className={`bg-white border border-[#e6e7f4] border-l-4 rounded-xl p-[18px] grid gap-4 items-start ${CARD_BORDER[b.status] || 'border-l-gray-200'}`}
              style={{ gridTemplateColumns: 'auto 1fr auto' }}
            >
              {/* Thumbnail */}
              <div
                className="w-[60px] h-[50px] rounded-lg flex-shrink-0"
                style={{ background: GRADIENTS[i % GRADIENTS.length] }}
              />

              {/* Main Content */}
              <div>
                <div className="text-[13px] font-bold text-[#191b24] mb-0.5">
                  {b.propertyTitle}{b.city ? ` — ${b.city}` : ''}
                </div>
                <div className="text-[12px] text-[#727787] mb-2">
                  {b.status} · {b.rent ? `${formatINR(b.rent)}/mo` : '—'}
                </div>

                {/* Renter Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: RENTER_COLORS[i % RENTER_COLORS.length] }}
                  >
                    {b.renterName?.slice(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#191b24]">{b.renterName}</div>
                    <div className="text-[11px] text-[#727787]">
                      {b.renterEmail}
                      {b.renterScore ? ` · ⭐ ${b.renterScore} renter score` : ''}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex gap-4 flex-wrap">
                  {b.moveIn && (
                    <Detail 
                      label="Move-in" 
                      value={new Date(b.moveIn).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })} 
                    />
                  )}
                  {b.duration && <Detail label="Duration" value={`${b.duration} months`} />}
                  {b.occupants && <Detail label="Tenants" value={b.occupants} />}
                  {b.message && (
                    <Detail
                      label="Message"
                      value={`"${b.message.length > 35 ? b.message.slice(0, 35) + '...' : b.message}"`}
                    />
                  )}
                </div>

                {/* Expandable Message */}
                {b.message && b.message.length > 35 && (
                  <button
                    onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    className="text-[11px] text-[#0053cc] font-semibold mt-1.5 hover:underline"
                  >
                    {expandedId === b.id ? 'Show less ↑' : 'Read full message ↓'}
                  </button>
                )}

                {expandedId === b.id && b.message && (
                  <div className="mt-2 bg-[#f2f3ff] rounded-lg px-3 py-2 text-[12px] text-[#424655] leading-relaxed">
                    {b.message}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`inline-block px-2.5 py-[3px] rounded-full text-[10px] font-bold mb-1 ${CHIP_STYLE[b.status] || ''}`}>
                  {b.status}
                </span>

                {b.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, 'Confirmed')}
                      disabled={isPending}
                      className="bg-[#1a6b32] text-white px-3.5 py-[7px] rounded-md text-[12px] font-bold hover:bg-green-800 disabled:opacity-60 transition-colors w-full text-center"
                    >
                      {isPending ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, 'Rejected')}
                      disabled={isPending}
                      className="bg-white text-[#93000a] border border-[#ffdad6] px-3.5 py-[7px] rounded-md text-[12px] font-bold hover:bg-red-50 disabled:opacity-60 transition-colors w-full text-center"
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status === 'Confirmed' && (
                  <button className="bg-white text-[#424655] border border-[#e6e7f4] px-3.5 py-[7px] rounded-md text-[12px] font-semibold hover:bg-gray-50 transition-colors w-full text-center">
                    View contract
                  </button>
                )}

                {b.status === 'Rejected' && (
                  <button className="bg-white text-[#424655] border border-[#e6e7f4] px-3.5 py-[7px] rounded-md text-[12px] font-semibold hover:bg-gray-50 transition-colors w-full text-center">
                    View details
                  </button>
                )}

                {b.status !== 'Rejected' && (
                  <button className="bg-white text-[#424655] border border-[#e6e7f4] px-3.5 py-[7px] rounded-md text-[12px] font-semibold hover:bg-gray-50 transition-colors w-full text-center">
                    Message
                  </button>
                )}

                <div className="text-[10px] text-[#727787] mt-1 text-right">
                  {b.createdAt ? timeAgo(b.createdAt) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

/* ── Helper Components ── */
function StatCard({ label, value, valueClass }) {
  return (
    <div className="bg-white border border-[#e6e7f4] rounded-xl px-4 py-3.5">
      <div className="text-[10px] font-bold tracking-widest text-[#727787] uppercase mb-1.5">{label}</div>
      <div className={`text-[20px] font-bold tracking-tight ${valueClass}`}>{value}</div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="text-[11px] text-[#424655]">
      <strong className="text-[#191b24] font-semibold">{label}:</strong> {value}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  if (days > 0)  return `${days === 1 ? '1 day' : `${days} days`} ago`
  if (hrs  > 0)  return `${hrs  === 1 ? '1 hr'  : `${hrs} hrs`} ago`
  if (mins > 0)  return `${mins} min ago`
  return 'just now'
}