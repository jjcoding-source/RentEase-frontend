

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'
import PageWrapper from '../../components/layout/PageWrapper'

const PROPERTY_TYPES   = ['Apartment', 'House', 'Studio', 'Villa']
const BEDROOM_OPTIONS  = ['Any', '1', '2', '3+']
const AMENITY_OPTIONS  = ['WiFi', 'Parking', 'Pool', 'Gym', 'Pet friendly', 'Furnished']
const SORT_OPTIONS     = [
  { value: 'relevance',  label: 'Sort: Relevance' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc',label: 'Price: High to low' },
  { value: 'newest',    label: 'Newest' },
]
const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-indigo-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
]

export default function RenterBrowse() {
  const navigate = useNavigate()

  const [priceRange,     setPriceRange]     = useState([8000, 60000])
  const [selectedTypes,  setSelectedTypes]  = useState([])
  const [bedrooms,       setBedrooms]       = useState('Any')
  const [amenities,      setAmenities]      = useState([])
  const [sort,           setSort]           = useState('relevance')
  const [search,         setSearch]         = useState('')
  const [savedIds,       setSavedIds]       = useState([])

  const filters = {
    minPrice: priceRange[0], maxPrice: priceRange[1],
    types: selectedTypes.join(','),
    bedrooms: bedrooms === 'Any' ? '' : bedrooms,
    amenities: amenities.join(','),
    sort, search,
  }

  const { data: properties = [], isLoading, isError } = useProperties(filters)

  function toggleType(t)    { setSelectedTypes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]) }
  function toggleAmenity(a) { setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]) }
  function toggleSaved(id)  { setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }
  function resetFilters()   { setPriceRange([8000, 60000]); setSelectedTypes([]); setBedrooms('Any'); setAmenities([]); setSort('relevance'); setSearch('') }

  return (
    <PageWrapper>
      <div className="flex gap-4 min-h-[calc(100vh-40px)]">

        {/* ── Filters sidebar ── */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 sticky top-0">

            <FilterSection title="Price range">
              <div className="flex justify-between text-[12px] text-[#424655] mb-1.5">
                <span>{formatINR(priceRange[0])}</span>
                <span>{formatINR(priceRange[1])}</span>
              </div>
              <input
                type="range" min={5000} max={100000} step={1000}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                className="w-full accent-[#1558c0]"
              />
              <div className="text-center text-[11px] font-semibold text-[#1558c0] mt-1">
                {formatINR(priceRange[0])} — {formatINR(priceRange[1])}/mo
              </div>
            </FilterSection>

            <FilterSection title="Property type">
              <div className="grid grid-cols-2 gap-1.5">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t} onClick={() => toggleType(t)}
                    className={`border rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                      selectedTypes.includes(t)
                        ? 'border-[#1558c0] text-[#1558c0] bg-[#eef4ff]'
                        : 'border-[#e2e8f0] text-[#64748b]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Bedrooms">
              <div className="flex gap-1.5 flex-wrap">
                {BEDROOM_OPTIONS.map(b => (
                  <button
                    key={b} onClick={() => setBedrooms(b)}
                    className={`border rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      bedrooms === b
                        ? 'border-[#1558c0] text-[#1558c0] bg-[#eef4ff]'
                        : 'border-[#e2e8f0] text-[#64748b]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Amenities">
              {AMENITY_OPTIONS.map(a => (
                <label key={a} className="flex items-center gap-2 py-1 text-[12px] text-[#334155] cursor-pointer">
                  <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-[#1558c0]" />
                  {a}
                </label>
              ))}
            </FilterSection>

            <button
              onClick={resetFilters}
              className="w-full bg-[#f8faff] border border-[#e2e8f0] rounded-lg py-2 text-[12px] font-semibold text-[#64748b] hover:bg-gray-100 transition-colors mt-1"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1">
          {/* Search + sort */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/>
                <path d="m21 21-4-4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                className="bg-transparent text-[12px] text-[#334155] outline-none w-full placeholder:text-gray-400"
                placeholder="Search properties..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span className="text-[12px] text-[#64748b]">
                {isLoading ? 'Loading...' : `${properties.length} found`}
              </span>
              <select
                value={sort} onChange={e => setSort(e.target.value)}
                className="border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#64748b] bg-white outline-none font-[inherit]"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Error */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              Failed to load properties.
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Property grid */}
          {!isLoading && !isError && (
            <>
              {properties.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No properties found. Try adjusting your filters.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {properties.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/properties/${p.id}`)}
                      className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden cursor-pointer hover:border-[#bfdbfe] hover:shadow-sm transition-all"
                    >
                      <div className={`h-32 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} relative`}>
                        {p.featured && (
                          <span className="absolute top-2 left-2 bg-[#1558c0]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">FEATURED</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); toggleSaved(p.id) }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs"
                        >
                          {savedIds.includes(p.id) ? '♥' : '♡'}
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase mb-0.5">
                          {p.type} · {p.bedrooms}BHK
                        </div>
                        <div className="text-[13px] font-semibold text-[#1e293b] mb-0.5">{p.title}</div>
                        <div className="text-[11px] text-[#94a3b8] mb-2">📍 {p.city}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-bold text-[#1558c0]">
                            {formatINR(p.rent)}<span className="text-[10px] font-normal text-[#94a3b8]">/mo</span>
                          </span>
                          {p.rating && (
                            <span className="text-[11px] text-[#64748b] bg-[#f8faff] px-2 py-0.5 rounded-full font-semibold">★ {p.rating}</span>
                          )}
                        </div>
                        {p.amenities?.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {p.amenities.slice(0, 3).map(a => (
                              <span key={a} className="text-[10px] bg-[#eef4ff] text-[#1558c0] px-1.5 py-0.5 rounded-full font-semibold">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase mb-2">{title}</h3>
      {children}
    </div>
  )
}