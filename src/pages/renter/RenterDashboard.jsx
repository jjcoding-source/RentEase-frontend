import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useMyBookings } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'
import api from '../../api/axiosInstance'
import { useQuery } from '@tanstack/react-query'

const STATUS_STYLE = {
  Confirmed: 'bg-[#dcfce7] text-[#15803d]',
  Pending:   'bg-[#fef9c3] text-[#b45309]',
  Rejected:  'bg-[#fee2e2] text-[#b91c1c]',
  Completed: 'bg-[#f1f5f9] text-[#475569]',
}

const CARD_GRADIENTS = [
  ['#bfdbfe', '#93c5fd', '#60a5fa', '#2563eb'],
  ['#fce7f3', '#f9a8d4', '#ec4899', '#be185d'],
  ['#dcfce7', '#86efac', '#4ade80', '#16a34a'],
  ['#ede9fe', '#c4b5fd', '#a78bfa', '#7c3aed'],
]

const NOTIF_DOT = {
  booking:  '#16a34a',
  reminder: '#b45309',
  price:    '#94a3b8',
  system:   '#94a3b8',
}

export default function RenterDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const { data: bookings = [], isLoading: loadingBookings } = useMyBookings()

  const { data: savedProperties = [] } = useQuery({
    queryKey: ['saved-properties'],
    queryFn:  () => api.get('/properties/saved').then(r => r.data),
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/notifications').then(r => r.data),
  })

  const activeBookings    = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending')
  const pendingBookings   = bookings.filter(b => b.status === 'Pending')
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed')
  const completedBookings = bookings.filter(b => b.status === 'Completed')
  const savedNow          = savedProperties.filter(p => p.availableNow).length
  const unread            = notifications.filter(n => !n.read).length

  async function markAllRead() {
    await api.post('/notifications/mark-all-read')
  }

  return (
    <PageWrapper
      pendingBookings={pendingBookings.length}
      savedCount={savedProperties.length}
      unreadNotifs={unread}
    >
      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[17px] font-bold text-[#0f172a]">My dashboard</div>
          <div className="text-[12px] text-[#64748b] mt-0.5">
            Welcome back, {user?.name?.split(' ')[0]} · {user?.city || 'India'}
          </div>
        </div>
        <button
          onClick={() => navigate('/properties')}
          className="bg-[#1558c0] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#1248a8] transition-colors"
        >
          + Find a home
        </button>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <MetricCard
          label="Active bookings"
          value={activeBookings.length}
          sub={`${confirmedBookings.length} confirmed · ${pendingBookings.length} pending`}
          color="#1558c0"
        />
        <MetricCard
          label="Saved properties"
          value={savedProperties.length}
          sub={`${savedNow} available now`}
          color="#b45309"
        />
        <MetricCard
          label="Total rentals"
          value={bookings.length}
          sub={`Since ${user?.memberSince || 'joining'}`}
          color="#0f766e"
        />
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <QuickAction
          icon={<SearchIcon />}
          bg="#dbeafe"
          label="Search homes"
          onClick={() => navigate('/properties')}
        />
        <QuickAction
          icon={<CalendarIcon />}
          bg="#dcfce7"
          label="View bookings"
          onClick={() => navigate('/my-bookings')}
        />
        <QuickAction
          icon={<HeartIcon />}
          bg="#fce7f3"
          label="Saved list"
          onClick={() => navigate('/saved')}
        />
      </div>

      {/* ── Two column content ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* My bookings */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-[#0f172a]">My bookings</h3>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-[11px] text-[#1558c0] font-semibold hover:underline"
            >
              View all
            </button>
          </div>

          {loadingBookings && (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-2.5 py-2.5 animate-pulse">
                  <div className="w-[54px] h-[46px] rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingBookings && bookings.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-2xl mb-1.5">📋</div>
              <div className="text-[12px] text-gray-400">No bookings yet.</div>
              <button
                onClick={() => navigate('/properties')}
                className="mt-1.5 text-[11px] text-[#1558c0] font-semibold hover:underline"
              >
                Browse properties →
              </button>
            </div>
          )}

          {!loadingBookings && bookings.slice(0, 3).map((b, i) => (
            <div
              key={b.id}
              className="flex gap-2.5 py-2.5 border-b border-[#f8faff] last:border-0 last:pb-0"
            >
              {/* Mini house illustration */}
              <div className="w-[54px] h-[46px] rounded-lg flex-shrink-0 overflow-hidden">
                <MiniHouse fills={CARD_GRADIENTS[i % CARD_GRADIENTS.length]} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-[#1e293b] truncate">{b.propertyTitle}</div>
                <div className="text-[10px] text-[#94a3b8] mb-1">
                  {b.city} ·{' '}
                  {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
                  {' – '}
                  {b.moveOut ? new Date(b.moveOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status] || ''}`}>
                    {b.status}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    {b.status === 'Confirmed' && b.daysToMoveIn
                      ? `Move-in in ${b.daysToMoveIn} days`
                      : b.status === 'Pending'
                      ? 'Awaiting owner'
                      : b.status === 'Completed'
                      ? `Ended ${b.moveOut ? new Date(b.moveOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="text-[12px] font-bold text-[#1558c0] whitespace-nowrap flex-shrink-0">
                {b.rent ? `₹${(b.rent / 1000).toFixed(0)}k/mo` : '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">

          {/* Saved properties */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[#0f172a]">Saved properties</h3>
              <button
                onClick={() => navigate('/saved')}
                className="text-[11px] text-[#1558c0] font-semibold hover:underline"
              >
                View all {savedProperties.length > 0 ? savedProperties.length : ''}
              </button>
            </div>

            {savedProperties.length === 0 ? (
              <div className="py-5 text-center">
                <div className="text-2xl mb-1">💙</div>
                <div className="text-[11px] text-gray-400">No saved properties yet.</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {savedProperties.slice(0, 2).map((p, i) => (
                  <div key={p.id} className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                    <div className={`h-[70px] relative overflow-hidden bg-gradient-to-br ${
                      i === 0 ? 'from-blue-100 to-blue-500' : 'from-green-100 to-green-500'
                    }`}>
                      <button
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/95 rounded-full flex items-center justify-center text-[11px] text-red-600 border border-[#e2e8f0]"
                        onClick={() => navigate(`/properties/${p.id}`)}
                      >
                        ♥
                      </button>
                    </div>
                    <div className="p-2">
                      <div className="text-[13px] font-bold text-[#1558c0]">
                        {formatINR(p.rent)}<span className="text-[10px] font-normal text-[#94a3b8]">/mo</span>
                      </div>
                      <div className="text-[11px] font-semibold text-[#1e293b] truncate mt-0.5">{p.title}</div>
                      <div className="text-[10px] text-[#94a3b8]">{p.city}</div>
                      <button
                        onClick={() => navigate(`/properties/${p.id}`)}
                        className="w-full mt-1.5 bg-[#eef4ff] border border-[#bfdbfe] text-[#1558c0] rounded-md py-1 text-[11px] font-semibold hover:bg-[#dbeafe] transition-colors"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[#0f172a]">Notifications</h3>
              <button
                onClick={markAllRead}
                className="text-[11px] text-[#1558c0] font-semibold hover:underline"
              >
                Mark all read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-gray-400">No notifications.</div>
            ) : (
              <div className="flex flex-col">
                {notifications.slice(0, 4).map((n, i) => (
                  <div
                    key={n.id || i}
                    className="flex gap-2 py-2.5 border-b border-[#f8faff] last:border-0"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: NOTIF_DOT[n.type] || '#94a3b8' }}
                    />
                    <div className="flex-1">
                      <div className={`text-[11px] leading-snug ${!n.read ? 'text-[#1e293b] font-semibold' : 'text-[#475569]'}`}>
                        {n.message}
                      </div>
                    </div>
                    <div className="text-[10px] text-[#94a3b8] whitespace-nowrap flex-shrink-0 mt-0.5">
                      {n.timeAgo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Small helpers ──
function MetricCard({ label, value, sub, color }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5">
      <div className="text-[10px] text-[#94a3b8] font-semibold mb-1.5">{label}</div>
      <div className="text-[20px] font-bold tracking-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] text-[#64748b] mt-0.5">{sub}</div>
    </div>
  )
}

function QuickAction({ icon, bg, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-[#e2e8f0] rounded-xl py-3 px-2 text-center hover:border-[#bfdbfe] hover:shadow-sm transition-all"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
        style={{ background: bg }}
      >
        {icon}
      </div>
      <div className="text-[11px] font-semibold text-[#334155]">{label}</div>
    </button>
  )
}

function MiniHouse({ fills = [] }) {
  const [bg, wall, roof, door] = fills
  return (
    <svg width="54" height="46" viewBox="0 0 54 46">
      <rect width="54" height="46" fill={bg}/>
      <rect x="7" y="12" width="40" height="30" rx="2" fill={wall}/>
      <polygon points="7,12 27,4 47,12" fill={roof}/>
      <rect x="20" y="22" width="14" height="24" rx="1" fill={door}/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#1558c0" strokeWidth="1.3"/>
      <path d="M11 11l3.5 3.5" stroke="#1558c0" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#16a34a" strokeWidth="1.3"/>
      <path d="M5 3V1M11 3V1M2 7h12" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 14L2.5 9C2 8.4 1.5 7.4 1.5 6.3a4 4 0 018 0 4 4 0 018 0c0 1.1-.5 2.1-1 2.7L8 14z" stroke="#be185d" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  )
}