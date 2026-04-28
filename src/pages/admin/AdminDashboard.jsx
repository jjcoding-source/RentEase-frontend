import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'
import api from '../../api/axiosInstance'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'


const adminApi = {
  getStats:       ()         => api.get('/admin/stats').then(r => r.data),
  getUsers:       ()         => api.get('/admin/users').then(r => r.data),
  getProperties:  ()         => api.get('/admin/properties').then(r => r.data),
  approveProperty:(id)       => api.patch(`/admin/properties/${id}/approve`),
  rejectProperty: (id)       => api.patch(`/admin/properties/${id}/reject`),
  deactivateUser: (id)       => api.patch(`/admin/users/${id}/deactivate`),
  activateUser:   (id)       => api.patch(`/admin/users/${id}/activate`),
}

const TABS       = ['Overview', 'Properties', 'Users']
const PROP_BADGE = { Active: 'green', Pending: 'amber', Inactive: 'gray', Rejected: 'red' }
const USER_BADGE = { Active: 'green', Suspended: 'red' }
const ROLE_COLOR = { Admin: '#be185d', Owner: '#16a34a', Renter: '#1558c0' }

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
  'from-indigo-200 to-blue-700',
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const qc               = useQueryClient()

  const [activeTab,    setActiveTab]    = useState('Overview')
  const [propFilter,   setPropFilter]   = useState('All')
  const [userFilter,   setUserFilter]   = useState('All')
  const [searchUser,   setSearchUser]   = useState('')
  const [searchProp,   setSearchProp]   = useState('')

  const { data: stats }      = useQuery({ queryKey: ['admin','stats'],      queryFn: adminApi.getStats })
  const { data: users  = [], isLoading: loadingUsers }
                             = useQuery({ queryKey: ['admin','users'],       queryFn: adminApi.getUsers })
  const { data: properties = [], isLoading: loadingProps }
                             = useQuery({ queryKey: ['admin','properties'],  queryFn: adminApi.getProperties })

  const { mutateAsync: approveProperty } = useMutation({
    mutationFn: adminApi.approveProperty,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin','properties'] }),
  })
  const { mutateAsync: rejectProperty } = useMutation({
    mutationFn: adminApi.rejectProperty,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin','properties'] }),
  })
  const { mutateAsync: toggleUser } = useMutation({
    mutationFn: ({ id, active }) => active ? adminApi.deactivateUser(id) : adminApi.activateUser(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin','users'] }),
  })

  // Filtered lists
  const filteredProps = properties
    .filter(p => propFilter === 'All' || p.status === propFilter)
    .filter(p => p.title?.toLowerCase().includes(searchProp.toLowerCase()))

  const filteredUsers = users
    .filter(u => userFilter === 'All' || u.role === userFilter)
    .filter(u =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
    )

  return (
    <div className="bg-[#f2f3ff] min-h-screen">

      {/* ── Top navbar ── */}
      <nav className="bg-white border-b border-[#e6e7f4] px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-bold text-[#0053cc]">Estates</span>
          <span className="bg-[#fce7f3] text-[#be185d] text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0053cc] text-white flex items-center justify-center text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-[#191b24]">{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/auth') }}
            className="text-[12px] text-gray-400 hover:text-gray-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-5">
          <h1 className="text-[22px] font-bold text-[#191b24] tracking-tight">Admin panel</h1>
          <p className="text-[13px] text-[#727787] mt-0.5">Platform overview and management</p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-1 bg-white border border-[#e6e7f4] rounded-xl p-1 mb-5 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === t ? 'bg-[#0053cc] text-white' : 'text-[#727787] hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <StatCard label="Total users"       value={stats?.totalUsers       ?? '—'} />
              <StatCard label="Total properties"  value={stats?.totalProperties  ?? '—'} />
              <StatCard label="Active bookings"   value={stats?.activeBookings   ?? '—'} valueColor="text-green-700" />
              <StatCard label="Pending review"    value={stats?.pendingProperties ?? '—'} valueColor="text-amber-700" />
            </div>

            {/* Second row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatCard label="Monthly revenue"   value={stats?.monthlyRevenue ? formatINR(stats.monthlyRevenue) : '—'} valueColor="text-[#0053cc]" />
              <StatCard label="Owners"            value={stats?.totalOwners   ?? '—'} />
              <StatCard label="Renters"           value={stats?.totalRenters  ?? '—'} />
            </div>

            {/* Pending properties quick view */}
            <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
                <h2 className="text-[14px] font-bold text-[#191b24]">Properties awaiting review</h2>
                <button
                  onClick={() => setActiveTab('Properties')}
                  className="text-[12px] text-[#0053cc] font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>
              {properties.filter(p => p.status === 'Pending').length === 0 ? (
                <div className="py-8 text-center text-[13px] text-gray-400">No pending properties.</div>
              ) : (
                <div className="divide-y divide-[#f2f3ff]">
                  {properties.filter(p => p.status === 'Pending').slice(0, 4).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${CARD_GRADIENTS[i % 4]} flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[#191b24]">{p.title}</div>
                        <div className="text-[11px] text-[#727787]">{p.city} · {p.ownerName} · {formatINR(p.rent)}/mo</div>
                      </div>
                      <div className="flex gap-1.5">
                        <AdminBtn onClick={() => approveProperty(p.id)} variant="green">Approve</AdminBtn>
                        <AdminBtn onClick={() => rejectProperty(p.id)}  variant="danger">Reject</AdminBtn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent users */}
            <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4]">
                <h2 className="text-[14px] font-bold text-[#191b24]">Recent users</h2>
                <button
                  onClick={() => setActiveTab('Users')}
                  className="text-[12px] text-[#0053cc] font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="divide-y divide-[#f2f3ff]">
                {users.slice(0, 5).map(u => (
                  <UserRow key={u.id} user={u} onToggle={toggleUser} />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Properties' && (
          <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4] flex-wrap gap-2">
              <h2 className="text-[14px] font-bold text-[#191b24]">All properties ({properties.length})</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-2 bg-[#f2f3ff] border border-[#e6e7f4] rounded-lg px-3 py-1.5">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" stroke="#727787" strokeWidth="2"/>
                    <path d="m21 21-4-4" stroke="#727787" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="bg-transparent text-[12px] outline-none w-36 placeholder:text-gray-400"
                    placeholder="Search properties..."
                    value={searchProp}
                    onChange={e => setSearchProp(e.target.value)}
                  />
                </div>
                {/* Filter */}
                {['All','Pending','Active','Inactive','Rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setPropFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      propFilter === f ? 'bg-[#0053cc] text-white' : 'text-[#727787] hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loadingProps && (
              <div className="py-10 text-center text-[13px] text-gray-400 animate-pulse">Loading properties...</div>
            )}

            {/* Empty */}
            {!loadingProps && filteredProps.length === 0 && (
              <div className="py-12 text-center text-[13px] text-gray-400">No properties found.</div>
            )}

            {/* Table */}
            {!loadingProps && filteredProps.length > 0 && (
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="bg-[#faf8ff]">
                    {['Property','Owner','Type','Rent','Status','Actions'].map((h, i) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                        style={{ width: ['30%','18%','12%','12%','12%','16%'][i] }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProps.map((p, i) => (
                    <tr key={p.id} className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-7 rounded bg-gradient-to-br ${CARD_GRADIENTS[i % 4]} flex-shrink-0`} />
                          <div>
                            <div className="text-[13px] font-semibold text-[#191b24] leading-snug">{p.title}</div>
                            <div className="text-[11px] text-[#727787]">{p.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#424655]">{p.ownerName}</td>
                      <td className="px-4 py-3 text-[12px] text-[#424655]">{p.type}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#0053cc]">{formatINR(p.rent)}</td>
                      <td className="px-4 py-3">
                        <Badge label={p.status} variant={PROP_BADGE[p.status] || 'gray'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {p.status === 'Pending' && (
                            <>
                              <AdminBtn onClick={() => approveProperty(p.id)} variant="green">Approve</AdminBtn>
                              <AdminBtn onClick={() => rejectProperty(p.id)}  variant="danger">Reject</AdminBtn>
                            </>
                          )}
                          {p.status === 'Active' && (
                            <AdminBtn onClick={() => rejectProperty(p.id)} variant="danger">Deactivate</AdminBtn>
                          )}
                          {(p.status === 'Inactive' || p.status === 'Rejected') && (
                            <AdminBtn onClick={() => approveProperty(p.id)} variant="green">Activate</AdminBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e6e7f4] flex-wrap gap-2">
              <h2 className="text-[14px] font-bold text-[#191b24]">All users ({users.length})</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-[#f2f3ff] border border-[#e6e7f4] rounded-lg px-3 py-1.5">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" stroke="#727787" strokeWidth="2"/>
                    <path d="m21 21-4-4" stroke="#727787" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="bg-transparent text-[12px] outline-none w-36 placeholder:text-gray-400"
                    placeholder="Search users..."
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                  />
                </div>
                {['All','Renter','Owner','Admin'].map(f => (
                  <button
                    key={f}
                    onClick={() => setUserFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      userFilter === f ? 'bg-[#0053cc] text-white' : 'text-[#727787] hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loadingUsers && (
              <div className="py-10 text-center text-[13px] text-gray-400 animate-pulse">Loading users...</div>
            )}

            {!loadingUsers && filteredUsers.length === 0 && (
              <div className="py-12 text-center text-[13px] text-gray-400">No users found.</div>
            )}

            {!loadingUsers && filteredUsers.length > 0 && (
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="bg-[#faf8ff]">
                    {['User','Email','Role','Joined','Status','Action'].map((h, i) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                        style={{ width: ['22%','24%','12%','14%','12%','16%'][i] }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: ROLE_COLOR[u.role] || '#0053cc' }}
                          >
                            {u.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-[13px] font-semibold text-[#191b24]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#424655] truncate">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: ROLE_COLOR[u.role] + '22',
                            color: ROLE_COLOR[u.role],
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#727787]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={u.isActive ? 'Active' : 'Suspended'} variant={u.isActive ? 'green' : 'red'} />
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'Admin' && (
                          <AdminBtn
                            onClick={() => toggleUser({ id: u.id, active: u.isActive })}
                            variant={u.isActive ? 'danger' : 'green'}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </AdminBtn>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AdminBtn({ children, onClick, variant = 'default' }) {
  const styles = {
    green:   'text-green-700 border-green-200 bg-green-50 hover:bg-green-100',
    danger:  'text-red-700 border-red-200 bg-white hover:bg-red-50',
    default: 'text-[#424655] border-[#e6e7f4] bg-white hover:bg-gray-50',
    primary: 'text-[#0053cc] border-[#b2c5ff] bg-[#f2f3ff] hover:bg-blue-50',
  }
  return (
    <button
      onClick={onClick}
      className={`border rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

function UserRow({ user: u, onToggle }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{ background: ROLE_COLOR[u.role] || '#0053cc' }}
      >
        {u.name?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-[#191b24]">{u.name}</div>
        <div className="text-[11px] text-[#727787]">{u.email}</div>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-2"
        style={{ background: ROLE_COLOR[u.role] + '22', color: ROLE_COLOR[u.role] }}
      >
        {u.role}
      </span>
      <Badge label={u.isActive ? 'Active' : 'Suspended'} variant={u.isActive ? 'green' : 'red'} />
    </div>
  )
}