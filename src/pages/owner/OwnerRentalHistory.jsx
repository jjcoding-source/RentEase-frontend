import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatINR } from '../../utils/formatCurrency'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { useOwnerRentalHistory } from '../../hooks/useBookings'

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-600',
  'from-cyan-200 to-teal-500',
  'from-violet-200 to-violet-600',
  'from-gray-200 to-gray-500',
]

export default function OwnerRentalHistory() {
  const navigate = useNavigate()

  // ── Hook ──
  const { data: history = [], isLoading } = useOwnerRentalHistory()

  // Calculate stats
  const totalRevenue = history.reduce((sum, h) => sum + (h.rent || 0) * (h.duration || 0), 0)
  const totalMonths  = history.reduce((sum, h) => sum + (h.duration || 0), 0)
  const uniqueProps  = new Set(history.map(h => h.propertyId)).size

  return (
    <PageWrapper>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[17px] font-bold text-[#191b24] tracking-tight">Rental history</h1>
          <p className="text-[12px] text-[#727787] mt-0.5">
            All completed rentals across your properties
          </p>
        </div>
        <button
          onClick={() => navigate('/owner/properties')}
          className="border border-[#e6e7f4] bg-white text-[#424655] px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors"
        >
          ← My properties
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Completed rentals" value={history.length} />
        <StatCard label="Properties rented" value={uniqueProps} />
        <StatCard label="Total months"      value={`${totalMonths} mo`} />
        <StatCard 
          label="Total revenue" 
          value={formatINR(totalRevenue)} 
          valueColor="text-[#0053cc]" 
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="bg-white border border-[#e6e7f4] rounded-xl h-16 animate-pulse" 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && history.length === 0 && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-[13px] text-gray-400 font-medium">No completed rentals yet.</div>
        </div>
      )}

      {/* Rental History Table */}
      {!isLoading && history.length > 0 && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e6e7f4]">
            <h2 className="text-[14px] font-bold text-[#191b24]">All completed rentals</h2>
          </div>

          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#faf8ff]">
                {['Property', 'Tenant', 'Period', 'Duration', 'Rent/mo', 'Total earned'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                    style={{ width: ['24%', '18%', '18%', '10%', '14%', '16%'][i] }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr 
                  key={h.id} 
                  className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] last:border-0"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-7 rounded bg-gradient-to-br ${CARD_GRADIENTS[i % 4]} flex-shrink-0`} />
                      <div>
                        <div className="text-[12px] font-semibold text-[#191b24] leading-snug">
                          {h.propertyTitle}
                        </div>
                        <div className="text-[10px] text-[#727787]">{h.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0053cc] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                        {h.renterName?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="text-[12px] font-medium text-[#191b24] truncate">
                        {h.renterName || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-[#64748b]">
                    {h.moveIn ? new Date(h.moveIn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    {' – '}
                    {h.moveOut ? new Date(h.moveOut).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#424655]">
                    {h.duration ? `${h.duration} mo` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#0053cc]">
                    {h.rent ? formatINR(h.rent) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#191b24]">
                    {h.rent && h.duration ? formatINR(h.rent * h.duration) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageWrapper>
  )
}