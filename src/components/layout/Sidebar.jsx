import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ownerLinks = [
  { to: '/owner/properties', label: 'My properties',  icon: 'home' },
  { to: '/owner/bookings',   label: 'Bookings',       icon: 'list', badge: true },
  { to: '/profile',          label: 'My profile',     icon: 'user' },
]

const renterLinks = [
  { to: '/properties', label: 'Browse',         icon: 'grid' },
  { to: '/profile',    label: 'My profile',     icon: 'user' },
]

const adminLinks = [
  { to: '/admin',      label: 'Admin panel',    icon: 'grid' },
  { to: '/profile',    label: 'My profile',     icon: 'user' },
]

const icons = {
  home: (
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  ),
  list: (
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </>
  ),
}

function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" className="w-4 h-4 opacity-70"
    >
      {icons[name]}
    </svg>
  )
}

export default function Sidebar({ pendingBookings = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links =
    user?.role === 'Owner' ? ownerLinks :
    user?.role === 'Admin' ? adminLinks :
    renterLinks

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  return (
    <aside className="bg-white border-r border-[#e6e7f4] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-[18px] border-b border-[#e6e7f4]">
        <span className="text-[17px] font-bold text-[#0053cc]">Estates</span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-5 py-4 border-b border-[#e6e7f4] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#0053cc] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#191b24]">{user.name}</div>
            <div className="text-[11px] text-gray-400">{user.role}</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 mt-1 flex flex-col gap-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#f2f3ff] text-[#0053cc] font-semibold'
                  : 'text-[#424655] hover:bg-gray-50'
              }`
            }
          >
            <NavIcon name={link.icon} />
            {link.label}
            {link.badge && pendingBookings > 0 && (
              <span className="ml-auto bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingBookings}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#e6e7f4]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#424655] hover:bg-gray-50 w-full transition-colors"
        >
          <NavIcon name="logout" />
          Log out
        </button>
      </div>
    </aside>
  )
}