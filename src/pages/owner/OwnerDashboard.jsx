import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperties } from '../../hooks/useProperties'
import { useOwnerBookings } from '../../hooks/useBookings'
import { formatINR } from '../../utils/formatCurrency'
import { useAuth } from '../../context/AuthContext'

const GRADIENTS = [
  'linear-gradient(135deg,#b5d4f4,#185fa5)',
  'linear-gradient(135deg,#adecff,#00687a)',
  'linear-gradient(135deg,#dce3eb,#3d444b)',
  'linear-gradient(135deg,#dae2ff,#0053cc)',
]

const RENTER_COLORS = ['#0053cc','#00687a','#3d444b','#a43700','#1a6b32','#854f0b']

const STATUS_CHIP = {
  Active:   'bg-[#e1f5e8] text-[#1a6b32]',
  Pending:  'bg-[#fff3cd] text-[#854f0b]',
  Inactive: 'bg-[#f2f3ff] text-[#424655]',
  Rejected: 'bg-[#ffdad6] text-[#93000a]',
}

const BOOKING_CHIP = {
  Pending:   'bg-[#fff3cd] text-[#854f0b]',
  Confirmed: 'bg-[#e1f5e8] text-[#1a6b32]',
  Rejected:  'bg-[#ffdad6] text-[#93000a]',
}

const CARD_BORDER = {
  Pending:   'border-l-[#f4a82a]',
  Confirmed: 'border-l-[#1a6b32]',
  Rejected:  'border-l-[#ba1a1a]',
}

const QUICK_ACTIONS = [
  {
    icon: '🏠',
    label: 'Add property',
    sub: 'List a new property',
    bg: '#dbeafe',
    to: '/owner/properties/add',
  },
  {
    icon: '📋',
    label: 'View bookings',
    sub: 'Pending requests',
    bg: '#fff3cd',
    to: '/owner/bookings',
  },
  {
    icon: '🏘',
    label: 'My listings',
    sub: 'Manage properties',
    bg: '#dcfce7',
    to: '/owner/properties',
  },
  {
    icon: '👤',
    label: 'My profile',
    sub: 'Edit your info',
    bg: '#f2f3ff',
    to: '/profile',
  },
]

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const { data: properties = [], isLoading: loadingProps }    = useProperties({ owner: true })
  const { data: bookings   = [], isLoading: loadingBookings } = useOwnerBookings()

  // Derived stats
  const activeProperties  = properties.filter(p => p.status === 'Active')
  const pendingProperties = properties.filter(p => p.status === 'Pending')
  const pendingBookings   = bookings.filter(b => b.status === 'Pending')
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed')

  const monthlyRevenue = activeProperties.reduce((sum, p) => {
    const hasConfirmed = confirmedBookings.some(b => b.propertyId === p.id)
    return hasConfirmed ? sum + (p.rent || 0) : sum
  }, 0)

  return (
    <PageWrapper pendingBookings={pendingBookings.length}>

      {/* ── Welcome bar ── */}
      <div className="flex items-start justify-between mb-5">
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
          className="flex items-center gap-1.5 bg-[#006aff] text-white px-[18px] py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] transition-colors"
        >
          + Add new property
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total listings"
          value={loadingProps ? '—' : properties.length}
          valueClass="text-[#0053cc]"
        />
        <StatCard
          label="Active"
          value={loadingProps ? '—' : activeProperties.length}
          valueClass="text-[#1a6b32]"
        />
        <StatCard
          label="Pending bookings"
          value={loadingBookings ? '—' : pendingBookings.length}
          valueClass="text-[#854f0b]"
        />
        <StatCard
          label="Monthly revenue"
          value={loadingProps ? '—' :
            monthlyRevenue >= 100000
              ? `₹${(monthlyRevenue / 100000).toFixed(1)}L`
              : formatINR(monthlyRevenue)
          }
          valueClass="text-[#191b24]"
        />
      </div>

      {/* ── Two column: listings + bookings ── */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* ── My listings ── */}
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
            <h2 className="text-[15px] font-bold text-[#191b24]">My listings</h2>
            <button
              onClick={() => navigate('/owner/properties')}
              className="text-[12px] text-[#0053cc] font-semibold hover:underline"
            >
              View all →
            </button>
          </div>

          {/* Loading */}
          {loadingProps && <SkeletonRows count={3} />}

          {/* Empty */}
          {!loadingProps && properties.length === 0 && (
            <EmptyState
              icon="🏠"
              message="No properties yet."
              action="Add your first property"
              onAction={() => navigate('/owner/properties/add')}
            />
          )}

          {/* List */}
          {!loadingProps && properties.slice(0, 5).map((p, i) => {
            const bookingCount = bookings.filter(b => b.propertyId === p.id).length
            return (
              <div
                key={p.id}
                onClick={() => navigate('/owner/properties')}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f2f3ff] last:border-0 hover:bg-[#faf8ff] transition-colors cursor-pointer"
              >
                {/* Thumb */}
                <div
                  className="w-10 h-8 rounded-md flex-shrink-0"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#191b24] truncate">{p.title}</div>
                  <div className="text-[11px] text-[#727787]">
                    {p.city}{p.state ? `, ${p.state}` : ''} · {formatINR(p.rent)}/mo
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {bookingCount > 0 && (
                    <span className="text-[10px] text-[#424655] bg-[#f2f3ff] px-2 py-0.5 rounded-full font-semibold">
                      {bookingCount} booking{bookingCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`inline-block px-2.5 py-[2px] rounded-full text-[11px] font-bold ${STATUS_CHIP[p.status] || STATUS_CHIP.Inactive}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Booking requests ── */}
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-[#191b24]">Booking requests</h2>
              {pendingBookings.length > 0 && (
                <span className="bg-[#ba1a1a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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

          {/* Loading */}
          {loadingBookings && <SkeletonRows count={3} />}

          {/* Empty */}
          {!loadingBookings && bookings.length === 0 && (
            <EmptyState icon="📋" message="No booking requests yet." />
          )}

          {/* Cards */}
          {!loadingBookings && bookings.slice(0, 4).map((b, i) => (
            <div
              key={b.id}
              onClick={() => navigate('/owner/bookings')}
              className={`flex items-center gap-3 px-5 py-3.5 border-b border-[#f2f3ff] last:border-0 border-l-4 hover:bg-[#faf8ff] transition-colors cursor-pointer ${CARD_BORDER[b.status] || 'border-l-transparent'}`}
            >
              {/* Renter avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: RENTER_COLORS[i % RENTER_COLORS.length] }}
              >
                {b.renterName?.slice(0, 2).toUpperCase() || '??'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#191b24] truncate">{b.renterName}</div>
                <div className="text-[11px] text-[#727787] truncate">
                  {b.propertyTitle}
                  {b.moveIn
                    ? ` · ${new Date(b.moveIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : ''}
                </div>
              </div>

              {/* Right: chip + rent */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`inline-block px-2.5 py-[2px] rounded-full text-[10px] font-bold ${BOOKING_CHIP[b.status] || ''}`}>
                  {b.status}
                </span>
                <span className="text-[11px] font-bold text-[#0053cc]">
                  {b.rent ? formatINR(b.rent) : '—'}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-white border border-[#e6e7f4] rounded-xl p-5 mb-4">
        <h2 className="text-[15px] font-bold text-[#191b24] mb-4">Quick actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(q => (
            <button
              key={q.label}
              onClick={() => navigate(q.to)}
              className="flex flex-col items-start p-4 rounded-xl border border-[#e6e7f4] hover:border-[#b2c5ff] hover:shadow-sm transition-all text-left"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 flex-shrink-0"
                style={{ background: q.bg }}
              >
                {q.icon}
              </div>
              <div className="text-[13px] font-bold text-[#191b24]">{q.label}</div>
              <div className="text-[11px] text-[#727787] mt-0.5">{q.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Pending admin review warning ── */}
      {pendingProperties.length > 0 && (
        <div className="bg-[#fff3cd] border border-[#f4a82a] rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#854f0b] mb-0.5">
                {pendingProperties.length} propert{pendingProperties.length > 1 ? 'ies' : 'y'} awaiting admin review
              </div>
              <div className="text-[12px] text-[#a16207] mb-3 leading-relaxed">
                These listings are not visible to renters until approved by an admin.
              </div>
              <div className="flex flex-col gap-1.5">
                {pendingProperties.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-[12px] text-[#854f0b]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f4a82a] flex-shrink-0" />
                    {p.title}{p.city ? ` — ${p.city}` : ''}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/owner/properties')}
              className="text-[12px] text-[#854f0b] font-semibold border border-[#f4a82a] px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0"
            >
              View listings
            </button>
          </div>
        </div>
      )}

    </PageWrapper>
  )
}

// ── Small helpers ──
function StatCard({ label, value, valueClass }) {
  return (
    <div className="bg-white border border-[#e6e7f4] rounded-xl p-4">
      <div className="text-[11px] font-bold tracking-widest text-[#727787] uppercase mb-1.5">{label}</div>
      <div className={`text-[22px] font-bold tracking-tight ${valueClass}`}>{value}</div>
    </div>
  )
}

function SkeletonRows({ count = 3 }) {
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