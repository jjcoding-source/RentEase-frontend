import PageWrapper from '../../components/layout/PageWrapper'
import { useQuery } from '@tanstack/react-query'
import { formatINR } from '../../utils/formatCurrency'
import api from '../../api/axiosInstance'

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-600',
  'from-green-200 to-green-600',
  'from-violet-200 to-violet-600',
  'from-gray-200 to-gray-500',
]

export default function RentalHistory() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['rental-history'],
    queryFn:  () => api.get('/bookings/history').then(r => r.data),
  })

  const totalSpent  = history.reduce((s, h) => s + (h.rent || 0) * (h.duration || 0), 0)
  const totalMonths = history.reduce((s, h) => s + (h.duration || 0), 0)

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-[17px] font-bold text-[#0f172a]">Rental history</h1>
        <p className="text-[12px] text-[#64748b] mt-0.5">All your past and completed rentals</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total rentals',      value: history.length,          color: '#1558c0' },
          { label: 'Months rented',      value: `${totalMonths} mo`,     color: '#0f766e' },
          { label: 'Total rent paid',    value: formatINR(totalSpent),   color: '#b45309' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl p-4">
            <div className="text-[10px] text-[#94a3b8] font-semibold mb-1.5">{s.label}</div>
            <div className="text-[18px] font-bold tracking-tight" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* History list */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl h-20 animate-pulse" />)}
        </div>
      )}

      {!isLoading && history.length === 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">🏠</div>
          <div className="text-[13px] text-gray-400 font-medium">No rental history yet.</div>
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e2e8f0]">
            <h2 className="text-[14px] font-bold text-[#0f172a]">All rentals ({history.length})</h2>
          </div>
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#f8faff]">
                {['Property', 'Period', 'Duration', 'Monthly rent', 'Total paid'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase border-b border-[#e2e8f0]"
                    style={{ width: ['32%','22%','13%','16%','17%'][i] }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} className="border-b border-[#f8faff] hover:bg-[#f8faff] last:border-0">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex-shrink-0`} />
                      <div>
                        <div className="text-[13px] font-semibold text-[#1e293b]">{h.propertyTitle}</div>
                        <div className="text-[11px] text-[#94a3b8]">{h.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#64748b]">
                    {h.moveIn ? new Date(h.moveIn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                    {' – '}
                    {h.moveOut ? new Date(h.moveOut).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#64748b]">{h.duration ? `${h.duration} mo` : '—'}</td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#1558c0]">{h.rent ? formatINR(h.rent) : '—'}</td>
                  <td className="px-4 py-3.5 text-[13px] font-bold text-[#0f172a]">
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