import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ── Renter sidebar config ──
const RENTER_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',  label: 'Dashboard',        icon: 'grid' },
      { to: '/properties', label: 'Browse properties', icon: 'search' },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { to: '/my-bookings',    label: 'My bookings',    icon: 'calendar', badgeKey: 'pendingBookings' },
      { to: '/rental-history', label: 'Rental history', icon: 'history' },
    ],
  },
  {
    label: 'Saved',
    items: [
      { to: '/saved', label: 'Saved properties', icon: 'heart', badgeKey: 'savedCount' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',       label: 'Profile & settings', icon: 'user' },
      { to: '/notifications', label: 'Notifications',      icon: 'bell',     badgeKey: 'unreadNotifs' },
      { to: '/settings',      label: 'Settings',           icon: 'settings' },
    ],
  },
]

// ── Owner sidebar config ──
const OWNER_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/owner',                label: 'Overview',       icon: 'grid' },
      { to: '/owner/properties',     label: 'My properties',  icon: 'home' },
      { to: '/owner/bookings',       label: 'Bookings',       icon: 'calendar', badgeKey: 'pendingBookings' },
      { to: '/owner/rental-history', label: 'Rental history', icon: 'history' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',  label: 'My profile', icon: 'user' },
      { to: '/settings', label: 'Settings',   icon: 'settings' },
    ],
  },
]

// ── Admin sidebar config ──
const ADMIN_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/admin',          label: 'Dashboard',    icon: 'grid' },
      { to: '/admin/bookings', label: 'All bookings', icon: 'calendar' },
      { to: '/properties',     label: 'Browse',       icon: 'search' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',  label: 'My profile', icon: 'user' },
      { to: '/settings', label: 'Settings',   icon: 'settings' },
    ],
  },
]

// ── SVG Icons ──
const ICONS = {
  grid: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <rect x="1" y="1" width="5" height="5" rx=".8" stroke={c} strokeWidth="1.1"/>
      <rect x="8" y="1" width="5" height="5" rx=".8" stroke={c} strokeWidth="1.1"/>
      <rect x="1" y="8" width="5" height="5" rx=".8" stroke={c} strokeWidth="1.1"/>
      <rect x="8" y="8" width="5" height="5" rx=".8" stroke={c} strokeWidth="1.1"/>
    </svg>
  ),
  search: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <circle cx="6" cy="6" r="4" stroke={c} strokeWidth="1.1"/>
      <path d="M10 10l3 3" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke={c} strokeWidth="1.1"/>
      <path d="M5 2.5V1M9 2.5V1M1.5 6h11" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  history: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M2 4h10M4 8h6M4 11h4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  heart: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M7 12L2 7.5C1.5 7 1 6.1 1 5a3 3 0 016-1 3 3 0 016 1c0 1.1-.5 2-1 2.5L7 12z" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
  ),
  user: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <circle cx="7" cy="5" r="2.5" stroke={c} strokeWidth="1.1"/>
      <path d="M2 13c0-2.761 2.239-4.5 5-4.5S12 10.239 12 13" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  bell: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M7 1.5a4 4 0 014 4v2.5l1 1.5H2L3 8V5.5a4 4 0 014-4z" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/>
      <path d="M5.5 10.5a1.5 1.5 0 003 0" stroke={c} strokeWidth="1.1"/>
    </svg>
  ),
  home: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M1 6l6-5 6 5v7a1 1 0 01-1 1H2a1 1 0 01-1-1V6z" stroke={c} strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <circle cx="7" cy="7" r="2" stroke={c} strokeWidth="1.1"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.5 2.5l1 1M10.5 10.5l1 1M11.5 2.5l-1 1M2.5 11.5l1-1" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  logout: (c) => (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <path d="M5.5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12h7A1.5 1.5 0 0011 10.5V7.5M8 2h4v4M7 7l5-5" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export default function Sidebar({ pendingBookings = 0, savedCount = 0, unreadNotifs = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const sections =
    user?.role === 'Owner' ? OWNER_SECTIONS :
    user?.role === 'Admin' ? ADMIN_SECTIONS :
    RENTER_SECTIONS

  const badgeValues = { pendingBookings, savedCount, unreadNotifs }

  const badgeStyle = {
    pendingBookings: 'bg-[#fef9c3] text-[#b45309]',
    savedCount:      'bg-[#dbeafe] text-[#1558c0]',
    unreadNotifs:    'bg-[#fee2e2] text-[#b91c1c]',
  }

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <aside className="bg-white border-r border-[#e2e8f0] flex flex-col min-h-screen w-[190px] flex-shrink-0">

      {/* ── Brand + role tag ── */}
      <div className="px-3.5 py-3 border-b border-[#e2e8f0]">
        <div className="text-[16px] font-bold text-[#1558c0]">
          Estates<span className="text-[#1e293b]">.</span>
        </div>
        <span className="text-[10px] bg-[#dbeafe] text-[#1558c0] px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
          {user?.role || 'Renter'}
        </span>
      </div>

      {/* ── Nav sections ── */}
      <nav className="flex-1 overflow-y-auto py-1">
        {sections.map((section) => (
          <div key={section.label} className="mb-1">

            {/* Section label */}
            <div className="text-[9px] font-bold tracking-widest text-[#94a3b8] uppercase px-3.5 pt-3 pb-1.5">
              {section.label}
            </div>

            {/* Nav items */}
            {section.items.map((item) => {
              const badgeVal = item.badgeKey ? badgeValues[item.badgeKey] : 0
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#eef4ff] text-[#1558c0] font-bold border-r-2 border-[#1558c0]'
                        : 'text-[#64748b] hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {ICONS[item.icon]?.(isActive ? '#1558c0' : '#64748b')}
                      <span className="flex-1">{item.label}</span>
                      {badgeVal > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeStyle[item.badgeKey]}`}>
                          {badgeVal}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}

        {/* ── Divider before logout ── */}
        <div className="mx-3.5 my-2 h-px bg-[#e2e8f0]" />

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-2 text-[12px] font-medium text-[#64748b] hover:bg-gray-50 w-full transition-colors"
        >
          {ICONS.logout('#64748b')}
          Logout
        </button>
      </nav>

      {/* ── User footer ── */}
      {user && (
        <div className="flex items-center gap-2 px-3.5 py-3 border-t border-[#e2e8f0]">
          <div className="w-[30px] h-[30px] rounded-full bg-[#1558c0] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {user.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#1e293b] leading-none truncate">{user.name}</div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">{user.role} account</div>
          </div>
        </div>
      )}
    </aside>
  )
}