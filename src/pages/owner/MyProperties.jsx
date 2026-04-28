import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperties, useDeleteProperty } from '../../hooks/useProperties'
import { useOwnerBookings } from '../../hooks/useBookings'
import { formatINR } from '../../utils/formatCurrency'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'Inactive']

const GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
  'from-indigo-200 to-blue-700',
]

const STATUS_BADGE = {
  Active:   'green',
  Pending:  'amber',
  Inactive: 'gray',
  Rejected: 'red',
}

export default function MyProperties() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null) 

  const { data: properties = [], isLoading, isError } = useProperties({ owner: true })
  const { data: bookings  = [] } = useOwnerBookings()
  const { mutateAsync: deleteProperty, isPending: isDeleting } = useDeleteProperty()

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length

  const filtered = activeFilter === 'All'
    ? properties
    : properties.filter(p => p.status === activeFilter)

  // Stats
  const totalActive   = properties.filter(p => p.status === 'Active').length
  const totalPending  = properties.filter(p => p.status === 'Pending').length
  const monthlyRev    = properties
    .filter(p => p.status === 'Active')
    .reduce((sum, p) => sum + p.rent, 0)

  async function handleDelete(id) {
    try {
      await deleteProperty(id)
      setConfirmDelete(null)
    } catch {
      alert('Failed to delete property.')
    }
  }

  return (
    <PageWrapper pendingBookings={pendingBookings}>

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[#191b24] tracking-tight">My properties</h1>
          <p className="text-[13px] text-[#727787] mt-0.5">Manage your listings and track performance</p>
        </div>
        <button
          onClick={() => navigate('/owner/properties/add')}
          className="bg-[#006aff] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] transition-colors flex items-center gap-1.5"
        >
          + Add new property
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total listings"  value={properties.length} />
        <StatCard label="Active"          value={totalActive}   valueColor="text-green-700" />
        <StatCard label="Pending review"  value={totalPending}  valueColor="text-amber-700" />
        <StatCard label="Monthly revenue" value={formatINR(monthlyRev)} />
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6e7f4]">
          <h2 className="text-[15px] font-bold text-[#191b24]">All listings</h2>
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                  activeFilter === f
                    ? 'bg-[#f2f3ff] text-[#0053cc]'
                    : 'text-[#727787] hover:bg-gray-50'
                }`}
              >
                {f} {f === 'All' ? `(${properties.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-12 text-center text-[13px] text-gray-400 animate-pulse">Loading properties...</div>
        )}

        {/* Error */}
        {isError && (
          <div className="py-8 text-center text-red-500 text-[13px]">Failed to load properties.</div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-14 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-[13px] text-gray-400 font-medium">No properties found.</div>
            <button
              onClick={() => navigate('/owner/properties/add')}
              className="mt-3 text-[13px] text-[#0053cc] font-semibold hover:underline"
            >
              Add your first property →
            </button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && filtered.length > 0 && (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#faf8ff]">
                {['Property', 'Type', 'Rent/mo', 'Status', 'Bookings', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                    style={{ width: ['32%','12%','13%','12%','13%','18%'][i] }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const activeBookings = bookings.filter(b => b.propertyId === p.id && b.status === 'Confirmed').length
                return (
                  <tr key={p.id} className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] transition-colors last:border-0">

                    {/* Property cell */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex-shrink-0`} />
                        <div>
                          <div className="text-[13px] font-semibold text-[#191b24] leading-snug">{p.title}</div>
                          <div className="text-[11px] text-[#727787]">{p.city}, {p.state}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-[13px] text-[#424655]">{p.type}</td>

                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#0053cc]">{formatINR(p.rent)}</td>

                    <td className="px-4 py-3.5">
                      <Badge label={p.status} variant={STATUS_BADGE[p.status] || 'gray'} />
                    </td>

                    <td className="px-4 py-3.5 text-[13px] text-[#191b24]">
                      {activeBookings > 0 ? `${activeBookings} active` : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <ActionBtn
                          onClick={() => navigate(`/owner/properties/${p.id}/edit`)}
                          variant="primary"
                        >
                          Edit
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => navigate(`/properties/${p.id}`)}
                          variant="default"
                        >
                          View
                        </ActionBtn>
                        {p.status === 'Inactive' ? (
                          <ActionBtn variant="green">Activate</ActionBtn>
                        ) : (
                          <ActionBtn
                            onClick={() => setConfirmDelete(p.id)}
                            variant="danger"
                          >
                            Delete
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl border border-[#e6e7f4]">
            <h3 className="text-[16px] font-bold text-[#191b24] mb-2">Delete property?</h3>
            <p className="text-[13px] text-[#727787] mb-6 leading-relaxed">
              This will permanently remove the listing and all associated bookings. This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-[#e6e7f4] rounded-lg py-2.5 text-[13px] font-semibold text-[#424655] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-[13px] font-bold hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}

// Action button 
function ActionBtn({ children, onClick, variant = 'default' }) {
  const styles = {
    primary: 'text-[#0053cc] border-[#b2c5ff] bg-[#f2f3ff] hover:bg-blue-50',
    default: 'text-[#424655] border-[#e6e7f4] bg-white hover:bg-gray-50',
    danger:  'text-red-700 border-red-200 bg-white hover:bg-red-50',
    green:   'text-green-700 border-green-200 bg-green-50 hover:bg-green-100',
  }
  return (
    <button
      onClick={onClick}
      className={`border rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}