import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperties } from '../../hooks/useProperties'
import { useOwnerBookings } from '../../hooks/useBookings'
import { formatINR } from '../../utils/formatCurrency'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
  'from-indigo-200 to-blue-700',
]

const STATUS_BADGE = {
  Pending:   'amber',
  Confirmed: 'green',
  Rejected:  'red',
}

const BORDER_STATUS = {
  Pending:   'border-l-amber-400',
  Confirmed: 'border-l-green-700',
  Rejected:  'border-l-red-700',
}

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: properties = [], isLoading: loadingProps } = useProperties({ owner: true })
  const { data: bookings   = [], isLoading: loadingBookings } = useOwnerBookings()

  const pendingBookings   = bookings.filter(b => b.status === 'Pending')
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed')
  const activeProperties  = properties.filter(p => p.status === 'Active')
  const pendingProperties = properties.filter(p => p.status === 'Pending')

  const monthlyRevenue = activeProperties.reduce((sum, p) => {
    const hasConfirmed = confirmedBookings.some(b => b.propertyId === p.id)
    return hasConfirmed ? sum + p.rent : sum
  }, 0)

  return (
    <PageWrapper pendingBookings={pendingBookings.length}>

      {/* ── Welcome bar ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#191b24] tracking-tight">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[13px] text-[#727787] mt-0.5">
            Here's an overview of your properties and bookings
          </p>
        </div>
        <button
          onClick={() => navigate('/owner/properties/add')}
          className="bg-[#006aff] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] transition-colors flex items-center gap-1.5"
        >
          + Add new property
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total listings"
          value={loadingProps ? '—' : properties.length}
        />
        <StatCard
          label="Active"
          value={loadingProps ? '—' : activeProperties.length}
          valueColor="text-green-700"
        />
        <StatCard
          label="Pending bookings"
          value={loadingBookings ? '—' : pendingBookings.length}
          valueColor="text-amber-700"
        />
        <StatCard
          label="Monthly revenue"
          value={loadingProps ? '—' : formatINR(monthlyRevenue)}
          valueColor="text-[#0053cc]"
        />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* ── My listings ── */}
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
            <h2 className="text-[14px] font-bold text-[#191b24]">My listings</h2>
            <button
              onClick={() => navigate('/owner/properties')}
              className="text-[12px] text-[#0053cc] font-semibold hover:underline"
            >
              View all →
            </button>
          </div>

          {loadingProps && <LoadingRows count={3} />}

          {!loadingProps && properties.length === 0 && (
            <EmptyState
              icon="🏠"
              message="No properties yet."
              action="Add your first property"
              onAction={() => navigate('/owner/properties/add')}
            />
          )}

          {!loadingProps && properties.slice(0, 5).map((p, i) => {
            const bookingCount = bookings.filter(b => b.propertyId === p.id).length
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f2f3ff] last:border-0 hover:bg-[#faf8ff] transition-colors cursor-pointer"
                onClick={() => navigate('/owner/properties')}
              >
                <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${CARD_GRADIENTS[i % 4]} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#191b24] truncate">{p.title}</div>
                  <div className="text-[11px] text-[#727787]">{p.city} · {formatINR(p.rent)}/mo</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {bookingCount > 0 && (
                    <span className="text-[10px] text-[#424655] bg-[#f2f3ff] px-2 py-0.5 rounded-full font-semibold">
                      {bookingCount} booking{bookingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <Badge
                    label={p.status}
                    variant={
                      p.status === 'Active'   ? 'green' :
                      p.status === 'Pending'  ? 'amber' :
                      p.status === 'Inactive' ? 'gray'  : 'red'
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Pending booking requests ── */}
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-bold text-[#191b24]">Booking requests</h2>
              {pendingBookings.length > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/owner/bookings')}
              className="text-[12px] text-[#0053cc] font-semibold hover:underline"
            >
              View all →
            </button>
          </div>

          {loadingBookings && <LoadingRows count={3} />}

          {!loadingBookings && bookings.length === 0 && (
            <EmptyState icon="📋" message="No booking requests yet." />
          )}

          {!loadingBookings && bookings.slice(0, 5).map((b, i) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 px-5 py-3.5 border-b border-[#f2f3ff] last:border-0 border-l-4 ${BORDER_STATUS[b.status] || 'border-l-transparent'} hover:bg-[#faf8ff] transition-colors cursor-pointer`}
              onClick={() => navigate('/owner/bookings')}
            >
              {/* Renter avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: '#0053cc' }}
              >
                {b.renterName?.slice(0, 2).toUpperCase() || '??'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#191b24] truncate">{b.renterName}</div>
                <div className="text-[11px] text-[#727787] truncate">
                  {b.propertyTitle} · {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge label={b.status} variant={STATUS_BADGE[b.status] || 'gray'} />
                <span className="text-[11px] font-bold text-[#0053cc]">
                  {b.rent ? formatINR(b.rent) : '—'}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="mt-5 bg-white border border-[#e6e7f4] rounded-xl p-5">
        <h2 className="text-[14px] font-bold text-[#191b24] mb-4">Quick actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: '🏠', label: 'Add property',
              sub: 'List a new property',
              color: '#dbeafe', textColor: '#1558c0',
              action: () => navigate('/owner/properties/add'),
            },
            {
              icon: '📋', label: 'View bookings',
              sub: `${pendingBookings.length} pending`,
              color: '#fff3cd', textColor: '#854f0b',
              action: () => navigate('/owner/bookings'),
            },
            {
              icon: '🏘', label: 'My listings',
              sub: `${properties.length} total`,
              color: '#dcfce7', textColor: '#1a6b32',
              action: () => navigate('/owner/properties'),
            },
            {
              icon: '👤', label: 'My profile',
              sub: 'Edit your info',
              color: '#f2f3ff', textColor: '#0040a1',
              action: () => navigate('/profile'),
            },
          ].map(q => (
            <button
              key={q.label}
              onClick={q.action}
              className="flex flex-col items-start p-4 rounded-xl border border-[#e6e7f4] hover:border-[#b2c5ff] hover:shadow-sm transition-all text-left"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3"
                style={{ background: q.color }}
              >
                {q.icon}
              </div>
              <div className="text-[13px] font-bold text-[#191b24]">{q.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: q.textColor }}>{q.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Pending properties ── */}
      {pendingProperties.length > 0 && (
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-amber-800 mb-0.5">
                {pendingProperties.length} propert{pendingProperties.length > 1 ? 'ies' : 'y'} awaiting admin review
              </div>
              <div className="text-[12px] text-amber-700 mb-3">
                These listings are not visible to renters until approved by an admin.
              </div>
              <div className="flex flex-col gap-1.5">
                {pendingProperties.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-[12px] text-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    {p.title} — {p.city}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/owner/properties')}
              className="text-[12px] text-amber-700 font-semibold border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0"
            >
              View listings
            </button>
          </div>
        </div>
      )}

    </PageWrapper>
  )
}

// helpers 
function LoadingRows({ count = 3 }) {
  return (
    <div className="flex flex-col divide-y divide-[#f2f3ff]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
          <div className="w-10 h-8 rounded-md bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-2.5 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="w-14 h-5 bg-gray-200 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ icon, message, action, onAction }) {
  return (
    <div className="py-12 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-[13px] text-gray-400 font-medium">{message}</div>
      {action && (
        <button
          onClick={onAction}
          className="mt-2 text-[12px] text-[#0053cc] font-semibold hover:underline"
        >
          {action} →
        </button>
      )}
    </div>
  )
}