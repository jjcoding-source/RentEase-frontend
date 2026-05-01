import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperties, useDeleteProperty } from '../../hooks/useProperties'
import { useOwnerBookings } from '../../hooks/useBookings'
import { useToast } from '../../components/ui/Toast'
import { StatCardSkeleton, TableRowSkeleton } from '../../components/ui/Skeleton'
import { formatINR } from '../../utils/formatCurrency'

const STATUS_FILTERS = ['All', 'Active', 'Pending', 'Inactive']

const GRADIENTS = [
  'linear-gradient(135deg,#b5d4f4,#185fa5)',
  'linear-gradient(135deg,#adecff,#00687a)',
  'linear-gradient(135deg,#dce3eb,#3d444b)',
  'linear-gradient(135deg,#dae2ff,#0053cc)',
  'linear-gradient(135deg,#dce3eb,#424655)',
]

const CHIP = {
  Active:   'bg-[#e1f5e8] text-[#1a6b32]',
  Pending:  'bg-[#fff3cd] text-[#854f0b]',
  Inactive: 'bg-[#f2f3ff] text-[#424655]',
  Rejected: 'bg-[#ffdad6] text-[#93000a]',
}

export default function MyProperties() {
  const navigate = useNavigate()
  const [activeFilter,  setActiveFilter]  = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: properties = [], isLoading, isError } = useProperties({ owner: true })
  const { data: bookings   = [] }                     = useOwnerBookings()
  const { mutateAsync: deleteProperty, isPending: isDeleting } = useDeleteProperty()

  const { toast } = useToast()

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length

  const filtered = activeFilter === 'All'
    ? properties
    : properties.filter(p => p.status === activeFilter)

  const totalActive  = properties.filter(p => p.status === 'Active').length
  const totalPending = properties.filter(p => p.status === 'Pending').length
  const monthlyRev   = properties
    .filter(p => p.status === 'Active')
    .reduce((s, p) => s + (p.rent || 0), 0)

  async function handleDelete(id) {
    try {
      await deleteProperty(id)
      setConfirmDelete(null)
      
      toast({
        message: 'Property deleted successfully.',
        type: 'success'
      })
    } catch (err) {
      toast({
        message: 'Failed to delete property. Please try again.',
        type: 'error'
      })
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
          className="flex items-center gap-1.5 bg-[#006aff] text-white px-[18px] py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] transition-colors"
        >
          + Add new property
        </button>
      </div>

      {/* ── Stats Section with Skeleton ── */}
      {isLoading ? (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Total listings"  value={properties.length} valueClass="text-[#0053cc]" />
          <StatCard label="Active"          value={totalActive}        valueClass="text-[#1a6b32]" />
          <StatCard label="Pending review"  value={totalPending}       valueClass="text-[#854f0b]" />
          <StatCard 
            label="Monthly revenue" 
            value={
              monthlyRev >= 100000
                ? `₹${(monthlyRev / 100000).toFixed(1)}L`
                : formatINR(monthlyRev)
            } 
            valueClass="text-[#191b24]" 
          />
        </div>
      )}

      {/* ── Table section ── */}
      <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">

        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e6e7f4]">
          <h2 className="text-[15px] font-bold text-[#191b24]">All listings</h2>
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => {
              const count = f === 'All'
                ? properties.length
                : properties.filter(p => p.status === f).length

              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-[5px] rounded-md text-[12px] font-semibold transition-colors ${
                    activeFilter === f
                      ? 'bg-[#f2f3ff] text-[#0053cc]'
                      : 'text-[#727787] hover:bg-gray-50'
                  }`}
                >
                  {f} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Loading State - Table Skeleton */}
        {isLoading && (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#faf8ff' }}>
                <th style={{ width: '32%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Property</th>
                <th style={{ width: '12%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Type</th>
                <th style={{ width: '13%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Rent/mo</th>
                <th style={{ width: '12%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Status</th>
                <th style={{ width: '13%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Bookings</th>
                <th style={{ width: '18%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map(i => (
                <TableRowSkeleton key={i} cols={6} />
              ))}
            </tbody>
          </table>
        )}

        {/* Error */}
        {isError && (
          <div className="py-8 text-center text-[13px] text-red-500">
            Failed to load properties.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="py-14 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-[13px] text-gray-400 font-medium mb-2">No properties found.</div>
            <button
              onClick={() => navigate('/owner/properties/add')}
              className="text-[13px] text-[#0053cc] font-semibold hover:underline"
            >
              Add your first property →
            </button>
          </div>
        )}

        {/* Real Table */}
        {!isLoading && !isError && filtered.length > 0 && (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#faf8ff' }}>
                <th style={{ width: '32%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Property</th>
                <th style={{ width: '12%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Type</th>
                <th style={{ width: '13%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Rent/mo</th>
                <th style={{ width: '12%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Status</th>
                <th style={{ width: '13%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Bookings</th>
                <th style={{ width: '18%' }} className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const activeBookingCount = bookings.filter(
                  b => b.propertyId === p.id && b.status === 'Confirmed'
                ).length

                return (
                  <tr
                    key={p.id}
                    className="border-b border-[#f2f3ff] last:border-0"
                    style={{ cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#faf8ff'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td className="px-4 py-[13px]">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-8 rounded-md flex-shrink-0"
                          style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                        />
                        <div>
                          <div className="text-[13px] font-semibold text-[#191b24] leading-snug">{p.title}</div>
                          <div className="text-[11px] text-[#727787]">{p.city}, {p.state}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-[13px] text-[13px] text-[#424655]">{p.type}</td>

                    <td className="px-4 py-[13px]">
                      <span className={`text-[13px] font-bold ${p.status === 'Inactive' ? 'text-[#727787]' : 'text-[#0053cc]'}`}>
                        {formatINR(p.rent)}
                      </span>
                    </td>

                    <td className="px-4 py-[13px]">
                      <span className={`inline-block px-2.5 py-[2px] rounded-full text-[11px] font-bold ${CHIP[p.status] || CHIP.Inactive}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="px-4 py-[13px] text-[13px] text-[#191b24]">
                      {activeBookingCount > 0 ? `${activeBookingCount} active` : '—'}
                    </td>

                    <td className="px-4 py-[13px]">
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

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm shadow-xl border border-[#e6e7f4]">
            <h3 className="text-[16px] font-bold text-[#191b24] mb-2">Delete property?</h3>
            <p className="text-[13px] text-[#727787] mb-6 leading-relaxed">
              This will permanently remove the listing and all associated bookings. This action cannot be undone.
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
                className="flex-1 bg-red-600 text-white rounded-lg py-2.5 text-[13px] font-bold hover:bg-red-700 disabled:opacity-60 transition-colors"
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

/* ── Helper Components ── */
function StatCard({ label, value, valueClass }) {
  return (
    <div className="bg-white border border-[#e6e7f4] rounded-xl p-4">
      <div className="text-[11px] font-bold tracking-widest text-[#727787] uppercase mb-1.5">{label}</div>
      <div className={`text-[22px] font-bold tracking-tight ${valueClass}`}>{value}</div>
    </div>
  )
}

function ActionBtn({ children, onClick, variant = 'default' }) {
  const styles = {
    primary: 'text-[#0053cc] border-[#b2c5ff] bg-[#f2f3ff] hover:bg-blue-50',
    default: 'text-[#424655] border-[#e6e7f4] bg-white hover:bg-gray-50',
    danger:  'text-[#93000a] border-[#ffdad6] bg-[#fff5f5] hover:bg-red-50',
    green:   'text-[#1a6b32] border-[#c8e6c9] bg-[#f1f8f2] hover:bg-green-50',
  }

  return (
    <button
      onClick={onClick}
      className={`border rounded-md px-2.5 py-[5px] text-[11px] font-semibold transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  )
}