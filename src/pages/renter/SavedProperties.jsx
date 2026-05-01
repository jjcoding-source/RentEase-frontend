import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatINR } from '../../utils/formatCurrency'
import { useSavedProperties, useUnsaveProperty } from '../../hooks/useProperties'

const CARD_GRADIENTS = [
  'from-blue-100 to-blue-500',
  'from-green-100 to-green-500',
  'from-violet-100 to-violet-500',
  'from-pink-100 to-pink-500',
  'from-cyan-100 to-cyan-500',
  'from-orange-100 to-orange-400',
]

export default function SavedProperties() {
  const navigate = useNavigate()

  // ── Real Hooks ──
  const { data: saved = [], isLoading } = useSavedProperties()
  const { mutateAsync: unsave } = useUnsaveProperty()

  const availableNow = saved.filter(p => p.availableNow).length

  // Handle unsave with optimistic feedback
  const handleUnsave = async (id) => {
    try {
      await unsave(id)
      
    } catch (error) {
      console.error('Failed to unsave property:', error)
      
    }
  }

  return (
    <PageWrapper savedCount={saved.length}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[17px] font-bold text-[#0f172a]">Saved properties</h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            {saved.length} saved · {availableNow} available now
          </p>
        </div>
        <button
          onClick={() => navigate('/properties')}
          className="bg-[#1558c0] text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-[#1248a8] transition-colors"
        >
          Browse more
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-36 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && saved.length === 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-16 text-center">
          <div className="text-4xl mb-3">💙</div>
          <div className="text-[14px] font-semibold text-[#334155] mb-1">
            No saved properties yet
          </div>
          <div className="text-[12px] text-gray-400 mb-4">
            Heart a property to save it here for later.
          </div>
          <button
            onClick={() => navigate('/properties')}
            className="bg-[#1558c0] text-white px-5 py-2 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] transition-colors"
          >
            Browse properties
          </button>
        </div>
      )}

      {/* Saved Properties Grid */}
      {!isLoading && saved.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {saved.map((p, i) => (
            <div 
              key={p.id} 
              className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:border-[#bfdbfe] hover:shadow-sm transition-all"
            >
              {/* Image / Header */}
              <div className={`h-36 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} relative`}>
                {p.featured && (
                  <span className="absolute top-2 left-2 bg-[#1558c0]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    FEATURED
                  </span>
                )}

                {/* Unsave Button */}
                <button
                  onClick={() => handleUnsave(p.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-white/95 rounded-full flex items-center justify-center text-[13px] text-red-500 border border-[#e2e8f0] hover:scale-110 transition-transform active:scale-95"
                >
                  ♥
                </button>

                {p.availableNow && (
                  <span className="absolute bottom-2 left-2 bg-[#dcfce7] text-[#15803d] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                    Available now
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <div className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase mb-0.5">
                  {p.type}
                </div>
                <div className="text-[13px] font-semibold text-[#1e293b] mb-0.5 truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-[#94a3b8] mb-2">📍 {p.city}</div>

                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[15px] font-bold text-[#1558c0]">
                    {formatINR(p.rent)}
                    <span className="text-[10px] font-normal text-[#94a3b8]">/mo</span>
                  </span>
                  {p.rating && (
                    <span className="text-[10px] bg-[#fef9c3] text-[#b45309] px-1.5 py-0.5 rounded-full font-bold border border-[#fde68a]">
                      ★ {p.rating}
                    </span>
                  )}
                </div>

                {/* Amenity tags */}
                {p.amenities?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-2.5">
                    {p.amenities.slice(0, 3).map(a => (
                      <span 
                        key={a} 
                        className="text-[9px] bg-[#eef4ff] text-[#1558c0] px-1.5 py-0.5 rounded-full font-semibold"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => navigate(`/properties/${p.id}`)}
                    className="flex-1 bg-[#eef4ff] border border-[#bfdbfe] text-[#1558c0] rounded-lg py-1.5 text-[11px] font-semibold hover:bg-[#dbeafe] transition-colors"
                  >
                    View details
                  </button>
                  <button
                    onClick={() => navigate(`/properties/${p.id}/book`)}
                    className="flex-1 bg-[#1558c0] text-white rounded-lg py-1.5 text-[11px] font-semibold hover:bg-[#1248a8] transition-colors"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}