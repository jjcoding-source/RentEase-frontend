import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useMyBookings } from '../../hooks/useBookings'
import { useSavedProperties } from '../../hooks/useProperties'
import { useNotifications, useMarkAllRead, useMarkOneRead } from '../../hooks/useNotifications'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/ui/Toast'

// ── Status config ──
const STATUS = {
  Confirmed: { pill: 'bg-[#dcfce7] text-[#15803d]',  dot: '#16a34a', label: 'Confirmed' },
  Pending:   { pill: 'bg-[#fef9c3] text-[#b45309]',  dot: '#b45309', label: 'Pending'   },
  Rejected:  { pill: 'bg-[#fee2e2] text-[#b91c1c]',  dot: '#b91c1c', label: 'Rejected'  },
  Completed: { pill: 'bg-[#f1f5f9] text-[#475569]',  dot: '#94a3b8', label: 'Completed' },
}

const NOTIF_DOT = {
  booking:  '#16a34a',
  reminder: '#b45309',
  price:    '#1558c0',
  system:   '#94a3b8',
}

// ── Mini house SVG for booking thumbnails ──
const HOUSE_FILLS = [
  ['#bfdbfe','#93c5fd','#60a5fa','#2563eb'],
  ['#fce7f3','#f9a8d4','#ec4899','#be185d'],
  ['#dcfce7','#86efac','#4ade80','#16a34a'],
  ['#ede9fe','#c4b5fd','#a78bfa','#7c3aed'],
]

function MiniHouse({ fills }) {
  const [bg, wall, roof, door] = fills
  return (
    <svg width="54" height="46" viewBox="0 0 54 46">
      <rect width="54" height="46" rx="0" fill={bg}/>
      <rect x="7" y="12" width="40" height="30" rx="2" fill={wall}/>
      <polygon points="7,12 27,4 47,12" fill={roof}/>
      <rect x="20" y="22" width="14" height="24" rx="1" fill={door}/>
    </svg>
  )
}

// ── Count-up hook ──
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === 0) return
    const start     = performance.now()
    const startVal  = 0

    function tick(now) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + eased * (target - startVal)))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return count
}

// ── Booking timeline ──
function BookingTimeline({ moveIn, moveOut, status }) {
  if (status !== 'Confirmed' || !moveIn) return null

  const now      = new Date()
  const start    = new Date(moveIn)
  const end      = moveOut ? new Date(moveOut) : new Date(start.getTime() + 11 * 30 * 24 * 60 * 60 * 1000)
  const total    = end - start
  const elapsed  = now - start
  const pct      = Math.min(Math.max((elapsed / total) * 100, 0), 100)
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
  const started  = now >= start

  if (!started) {
    const daysTo = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
    return (
      <div className="mt-2 pt-2 border-t border-[#f8faff]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#94a3b8] font-medium">Move-in countdown</span>
          <span className="text-[10px] font-bold text-[#1558c0]">{daysTo}d away</span>
        </div>
        <div className="h-1 bg-[#e2e8f0] rounded-full overflow-hidden">
          <div className="h-full bg-[#dbeafe] rounded-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 pt-2 border-t border-[#f8faff]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#94a3b8] font-medium">Lease progress</span>
        <span className="text-[10px] font-bold text-[#1558c0]">{daysLeft}d left</span>
      </div>
      <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1558c0] to-[#60a5fa] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-[#94a3b8]">
          {new Date(moveIn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
        <span className="text-[9px] text-[#94a3b8]">
          {end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  )
}

// ── Pulse dot ──
function PulseDot({ color = '#16a34a' }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ background: color }}
      />
    </span>
  )
}

export default function RenterDashboard() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { toast }      = useToast()

  const { data: bookings      = [], isLoading: loadingBookings }  = useMyBookings()
  const { data: saved         = [], isLoading: loadingSaved }     = useSavedProperties()
  const { data: notifications = [], isLoading: loadingNotifs }    = useNotifications()
  const { mutateAsync: markAll }  = useMarkAllRead()
  const { mutateAsync: markOne }  = useMarkOneRead()

  // Derived stats
  const activeBookings    = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending')
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed')
  const pendingBookings   = bookings.filter(b => b.status === 'Pending')
  const savedNow          = saved.filter(p => p.availableNow).length
  const unread            = notifications.filter(n => !n.read).length

  // Count-up values
  const activeCount = useCountUp(activeBookings.length)
  const savedCount  = useCountUp(saved.length)
  const totalCount  = useCountUp(bookings.length)

  async function handleMarkAll() {
    try {
      await markAll()
      toast({ message: 'All notifications marked as read.', type: 'success' })
    } catch {
      toast({ message: 'Failed to mark notifications.', type: 'error' })
    }
  }

  async function handleMarkOne(id, isRead) {
    if (isRead) return
    try { await markOne(id) } catch {}
  }

  // Greeting based on time
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <PageWrapper
      pendingBookings={pendingBookings.length}
      savedCount={saved.length}
      unreadNotifs={unread}
    >

      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-bold text-[#0f172a] tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
          </div>
          <div className="text-[12px] text-[#64748b] mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            {user?.city || 'India'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-1.5 bg-[#1558c0] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#1248a8] active:scale-95 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5.5" cy="5.5" r="4" stroke="#fff" strokeWidth="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Find a home
        </button>
      </div>

      {/* ── Metric cards with count-up ── */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Active bookings */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 hover:border-[#1558c0]/30 hover:shadow-sm transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wider">
              Active bookings
            </span>
            <div className="w-6 h-6 bg-[#dbeafe] rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#1558c0" strokeWidth="1"/>
                <path d="M4 2V1M8 2V1M1 5h10" stroke="#1558c0" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="text-[22px] font-bold text-[#1558c0] tracking-tight leading-none mb-1">
            {loadingBookings ? (
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            ) : activeCount}
          </div>
          <div className="text-[11px] text-[#64748b]">
            {confirmedBookings.length} confirmed
            {pendingBookings.length > 0 && (
              <span className="ml-1.5 bg-[#fef9c3] text-[#b45309] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingBookings.length} pending
              </span>
            )}
          </div>
        </div>

        {/* Saved properties */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 hover:border-[#b45309]/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wider">
              Saved properties
            </span>
            <div className="w-6 h-6 bg-[#fce7f3] rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10.5L1.5 6.5C1 6 .5 5.2.5 4.3a2.5 2.5 0 015 0 2.5 2.5 0 015 0c0 .9-.5 1.7-1 2.2L6 10.5z" stroke="#be185d" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="text-[22px] font-bold text-[#b45309] tracking-tight leading-none mb-1">
            {loadingSaved ? (
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            ) : savedCount}
          </div>
          <div className="text-[11px] text-[#64748b] flex items-center gap-1.5">
            {savedNow > 0 && <PulseDot color="#22c55e" />}
            {savedNow > 0 ? `${savedNow} available now` : 'Browse to save more'}
          </div>
        </div>

        {/* Total rentals */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 hover:border-[#0f766e]/30 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#94a3b8] font-semibold uppercase tracking-wider">
              Total rentals
            </span>
            <div className="w-6 h-6 bg-[#dcfce7] rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 5.5l5-4 5 4V11a.5.5 0 01-.5.5H1.5A.5.5 0 011 11V5.5z" stroke="#0f766e" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="text-[22px] font-bold text-[#0f766e] tracking-tight leading-none mb-1">
            {loadingBookings ? (
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            ) : totalCount}
          </div>
          <div className="text-[11px] text-[#64748b]">
            Since {user?.memberSince
              ? new Date(user.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : 'joining'}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          {
            label: 'Search homes',
            bg: '#dbeafe', iconBg: '#1558c0',
            to: '/properties',
            icon: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="#fff" strokeWidth="1.3"/>
                <path d="M10.5 10.5l3 3" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            label: 'View bookings',
            bg: '#dcfce7', iconBg: '#16a34a',
            badge: pendingBookings.length > 0 ? pendingBookings.length : null,
            to: '/my-bookings',
            icon: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="#fff" strokeWidth="1.3"/>
                <path d="M5 2.5V1M10 2.5V1M1.5 6.5h12" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            label: 'Saved list',
            bg: '#fce7f3', iconBg: '#be185d',
            badge: savedNow > 0 ? `${savedNow} available` : null,
            badgeStyle: 'bg-[#dcfce7] text-[#15803d]',
            to: '/saved',
            icon: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 13L2 8c-.7-.7-1-1.6-1-2.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0c0 .9-.4 1.8-1 2.5L7.5 13z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            ),
          },
        ].map(q => (
          <button
            key={q.label}
            onClick={() => navigate(q.to)}
            className="bg-white border border-[#e2e8f0] rounded-xl py-3 px-2 text-center hover:border-[#bfdbfe] hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
              style={{ background: q.iconBg }}
            >
              {q.icon}
            </div>
            <div className="text-[11px] font-semibold text-[#334155]">{q.label}</div>
            {q.badge && (
              <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                q.badgeStyle || 'bg-[#fef9c3] text-[#b45309]'
              }`}>
                {q.badge}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Two column ── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* ── My bookings card ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f8faff]">
            <h3 className="text-[13px] font-bold text-[#0f172a]">My bookings</h3>
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-[11px] text-[#1558c0] font-semibold hover:underline flex items-center gap-0.5"
            >
              View all
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 2l3 3-3 3" stroke="#1558c0" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Loading skeleton */}
          {loadingBookings && (
            <div className="p-4 flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-2.5 animate-pulse">
                  <div className="w-[54px] h-[46px] rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="h-3 w-10 bg-gray-200 rounded self-start" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingBookings && bookings.length === 0 && (
            <div className="py-10 text-center px-4">
              <div className="w-12 h-12 bg-[#eef4ff] rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="2" y="3" width="18" height="17" rx="2.5" stroke="#1558c0" strokeWidth="1.3"/>
                  <path d="M7 3V1M15 3V1M2 8h18" stroke="#1558c0" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M7 13h4M7 16h2" stroke="#1558c0" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="text-[12px] font-semibold text-[#334155] mb-1">No bookings yet</div>
              <div className="text-[11px] text-[#94a3b8] mb-3">Find your perfect home and send a booking request</div>
              <button
                onClick={() => navigate('/properties')}
                className="bg-[#1558c0] text-white px-4 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#1248a8] transition-colors"
              >
                Browse properties
              </button>
            </div>
          )}

          {/* Booking items */}
          {!loadingBookings && bookings.slice(0, 3).map((b, i) => {
            const st = STATUS[b.status] || STATUS.Completed
            return (
              <div
                key={b.id}
                className="px-4 py-3 border-b border-[#f8faff] last:border-0 hover:bg-[#fafbff] transition-colors cursor-pointer"
                onClick={() => navigate('/my-bookings')}
              >
                <div className="flex gap-2.5">
                  {/* Thumbnail */}
                  <div className="w-[54px] h-[46px] rounded-lg flex-shrink-0 overflow-hidden">
                    {b.images?.[0] ? (
                      <img src={b.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MiniHouse fills={HOUSE_FILLS[i % HOUSE_FILLS.length]} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-[#1e293b] truncate leading-snug">
                      {b.propertyTitle}
                    </div>
                    <div className="text-[10px] text-[#94a3b8] mb-1.5 truncate">
                      {b.city} ·{' '}
                      {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}
                      {' – '}
                      {b.moveOut ? new Date(b.moveOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.pill}`}>
                        {st.label}
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {b.status === 'Confirmed' && b.daysToMoveIn
                          ? `Move-in in ${b.daysToMoveIn}d`
                          : b.status === 'Pending'
                          ? 'Awaiting owner'
                          : b.status === 'Completed'
                          ? 'Completed'
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-[12px] font-bold text-[#1558c0] whitespace-nowrap flex-shrink-0">
                    {b.rent
                      ? b.rent >= 1000
                        ? `₹${(b.rent / 1000).toFixed(b.rent % 1000 === 0 ? 0 : 1)}k/mo`
                        : `₹${b.rent}/mo`
                      : '—'}
                  </div>
                </div>

                {/* Timeline for confirmed */}
                <BookingTimeline
                  moveIn={b.moveIn}
                  moveOut={b.moveOut}
                  status={b.status}
                />
              </div>
            )
          })}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-3">

          {/* ── Saved properties ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f8faff]">
              <h3 className="text-[13px] font-bold text-[#0f172a]">Saved properties</h3>
              <button
                onClick={() => navigate('/saved')}
                className="text-[11px] text-[#1558c0] font-semibold hover:underline flex items-center gap-0.5"
              >
                View all {saved.length > 0 ? saved.length : ''}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 2l3 3-3 3" stroke="#1558c0" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Loading */}
            {loadingSaved && (
              <div className="p-3 grid grid-cols-2 gap-2">
                {[1,2].map(i => (
                  <div key={i} className="border border-[#e2e8f0] rounded-lg overflow-hidden animate-pulse">
                    <div className="h-[70px] bg-gray-200" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loadingSaved && saved.length === 0 && (
              <div className="py-7 text-center px-4">
                <div className="w-10 h-10 bg-[#fce7f3] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 16L2.5 10C1.5 9 1 7.7 1 6.5a4 4 0 018 0 4 4 0 018 0c0 1.2-.5 2.5-1.5 3.5L9 16z" stroke="#be185d" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-[11px] font-semibold text-[#334155] mb-0.5">Nothing saved yet</div>
                <div className="text-[10px] text-[#94a3b8]">Heart a property to save it here</div>
              </div>
            )}

            {/* Saved grid */}
            {!loadingSaved && saved.length > 0 && (
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {saved.slice(0, 2).map((p, i) => (
                    <div
                      key={p.id}
                      className="border border-[#e2e8f0] rounded-lg overflow-hidden hover:border-[#bfdbfe] hover:shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
                      onClick={() => navigate(`/properties/${p.id}`)}
                    >
                      {/* Image */}
                      <div className={`h-[70px] relative overflow-hidden ${
                        i === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-500'
                                : 'bg-gradient-to-br from-green-100 to-green-500'
                      }`}>
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                        {/* Available now badge */}
                        {p.availableNow && (
                          <div className="absolute bottom-1.5 left-1.5">
                            <span className="flex items-center gap-1 bg-white/95 text-[#15803d] text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#bbf7d0]">
                              <PulseDot color="#16a34a" />
                              Now
                            </span>
                          </div>
                        )}
                        {/* Heart */}
                        <button
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/95 rounded-full flex items-center justify-center text-red-500 text-[11px] border border-[#e2e8f0] hover:scale-110 transition-transform"
                          onClick={e => { e.stopPropagation() }}
                        >
                          ♥
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-2">
                        <div className="text-[13px] font-bold text-[#1558c0] leading-none">
                          ₹{(p.rent / 1000).toFixed(0)}k
                          <span className="text-[10px] font-normal text-[#94a3b8]">/mo</span>
                        </div>
                        <div className="text-[11px] font-semibold text-[#1e293b] mt-0.5 truncate">{p.title}</div>
                        <div className="text-[10px] text-[#94a3b8] truncate">{p.city}</div>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/properties/${p.id}`) }}
                          className="w-full mt-2 bg-[#eef4ff] border border-[#bfdbfe] text-[#1558c0] rounded-md py-1.5 text-[11px] font-semibold hover:bg-[#dbeafe] transition-colors"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Notifications ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f8faff]">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold text-[#0f172a]">Notifications</h3>
                {unread > 0 && (
                  <span className="bg-[#fee2e2] text-[#b91c1c] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] text-[#1558c0] font-semibold hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Loading */}
            {loadingNotifs && (
              <div className="p-4 flex flex-col gap-2.5">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 bg-gray-200 rounded w-full" />
                      <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                    </div>
                    <div className="h-2.5 w-10 bg-gray-200 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loadingNotifs && notifications.length === 0 && (
              <div className="py-7 text-center px-4">
                <div className="text-xl mb-1.5">🔔</div>
                <div className="text-[11px] text-[#94a3b8]">No notifications yet</div>
              </div>
            )}

            {/* Notification items */}
            {!loadingNotifs && notifications.slice(0, 4).map((n, i) => (
              <div
                key={n.id || i}
                onClick={() => handleMarkOne(n.id, n.isRead ?? n.read)}
                className={`flex gap-2.5 px-4 py-2.5 border-b border-[#f8faff] last:border-0 cursor-pointer transition-colors ${
                  !(n.isRead ?? n.read)
                    ? 'bg-[#fafbff] hover:bg-[#eef4ff]'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Dot */}
                <div className="flex-shrink-0 mt-[5px]">
                  {!(n.isRead ?? n.read) ? (
                    <PulseDot color={NOTIF_DOT[n.type] || '#94a3b8'} />
                  ) : (
                    <span
                      className="block w-2 h-2 rounded-full opacity-40"
                      style={{ background: NOTIF_DOT[n.type] || '#94a3b8' }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] leading-[1.5] ${
                    !(n.isRead ?? n.read) ? 'text-[#1e293b] font-semibold' : 'text-[#475569]'
                  }`}>
                    {/* Highlight property names in blue */}
                    {n.message}
                  </div>
                  {n.subtext && (
                    <div className="text-[10px] text-[#94a3b8] mt-0.5">{n.subtext}</div>
                  )}
                </div>

                {/* Time + unread indicator */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-[#94a3b8] whitespace-nowrap">
                    {n.timeAgo}
                  </span>
                  {!(n.isRead ?? n.read) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1558c0]" />
                  )}
                </div>
              </div>
            ))}

            {/* View all notifications link */}
            {notifications.length > 4 && (
              <div className="px-4 py-2.5 border-t border-[#f8faff]">
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full text-[11px] text-[#1558c0] font-semibold hover:underline text-center"
                >
                  View all {notifications.length} notifications →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}