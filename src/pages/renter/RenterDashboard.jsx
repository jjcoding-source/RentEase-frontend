import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'

const PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Villa']
const BEDROOM_OPTIONS = ['Any', '1', '2', '3+']
const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'Gym', 'Pet friendly', 'Furnished']
const SORT_OPTIONS = [
  { value: 'relevance',   label: 'Sort: Relevance' },
  { value: 'price_asc',  label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'newest',     label: 'Newest' },
]

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-indigo-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
]

export default function RenterDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Filter state
  const [priceRange, setPriceRange]     = useState([8000, 60000])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [bedrooms, setBedrooms]         = useState('Any')
  const [amenities, setAmenities]       = useState([])
  const [sort, setSort]                 = useState('relevance')
  const [search, setSearch]             = useState('')
  const [savedIds, setSavedIds]         = useState([])

  const filters = {
    minPrice:  priceRange[0],
    maxPrice:  priceRange[1],
    types:     selectedTypes.join(','),
    bedrooms:  bedrooms === 'Any' ? '' : bedrooms,
    amenities: amenities.join(','),
    sort,
    search,
  }

  const { data: properties = [], isLoading, isError } = useProperties(filters)

  function toggleType(type) {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function toggleAmenity(a) {
    setAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    )
  }

  function toggleSaved(id) {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function resetFilters() {
    setPriceRange([8000, 60000])
    setSelectedTypes([])
    setBedrooms('Any')
    setAmenities([])
    setSort('relevance')
    setSearch('')
  }

  return (
    <div className="bg-[#f2f3ff] min-h-screen">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e6e7f4] flex items-center justify-between px-6 h-14 sticky top-0 z-10">
        <span className="text-[18px] font-bold text-[#0053cc]">Estates</span>

        <div className="flex items-center gap-2 bg-[#f2f3ff] border border-[#e6e7f4] rounded-lg px-3 py-1.5 w-52">
          <SearchIcon />
          <input
            className="bg-transparent text-[13px] text-[#424655] outline-none w-full placeholder:text-gray-400"
            placeholder="Search properties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f2f3ff] border border-[#e6e7f4] flex items-center justify-center text-sm cursor-pointer relative">
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full border border-white" />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0053cc] text-white flex items-center justify-center text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-[#191b24]">{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/auth') }}
            className="text-[12px] text-gray-400 hover:text-gray-600 ml-1"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="grid min-h-[calc(100vh-56px)]" style={{ gridTemplateColumns: '240px 1fr' }}>

        {/* ── Sidebar filters ── */}
        <aside className="bg-white border-r border-[#e6e7f4] p-5 overflow-y-auto">

          {/* Price range */}
          <FilterSection title="Price range">
            <div className="flex justify-between text-[12px] text-[#424655] mb-1.5">
              <span>{formatINR(priceRange[0])}</span>
              <span>{formatINR(priceRange[1])}</span>
            </div>
            <input
              type="range" min={5000} max={100000} step={1000}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              className="w-full accent-[#0053cc]"
            />
            <div className="text-center text-[12px] font-semibold text-[#0053cc] mt-1">
              {formatINR(priceRange[0])} — {formatINR(priceRange[1])} / mo
            </div>
          </FilterSection>

          {/* Property type */}
          <FilterSection title="Property type">
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`border rounded-md py-1.5 text-[11px] font-semibold transition-colors ${
                    selectedTypes.includes(t)
                      ? 'border-[#0053cc] text-[#0053cc] bg-[#f2f3ff]'
                      : 'border-[#e6e7f4] text-[#424655]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Bedrooms */}
          <FilterSection title="Bedrooms">
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {BEDROOM_OPTIONS.map(b => (
                <button
                  key={b}
                  onClick={() => setBedrooms(b)}
                  className={`border rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    bedrooms === b
                      ? 'border-[#0053cc] text-[#0053cc] bg-[#f2f3ff]'
                      : 'border-[#e6e7f4] text-[#424655]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Amenities */}
          <FilterSection title="Amenities">
            {AMENITY_OPTIONS.map(a => (
              <label key={a} className="flex items-center gap-2 py-1.5 text-[13px] text-[#191b24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="accent-[#0053cc]"
                />
                {a}
              </label>
            ))}
          </FilterSection>

          <button
            onClick={resetFilters}
            className="w-full bg-[#f2f3ff] border border-[#e6e7f4] rounded-lg py-2.5 text-[13px] font-semibold text-[#424655] hover:bg-gray-100 transition-colors mt-2"
          >
            Reset filters
          </button>
        </aside>

        {/* ── Main content ── */}
        <main className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-[#191b24]">
              {isLoading ? 'Loading...' : `${properties.length} properties found`}
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="border border-[#e6e7f4] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#424655] bg-white outline-none cursor-pointer font-[inherit]"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button className="border border-[#e6e7f4] rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#0053cc] bg-[#f2f3ff] flex items-center gap-1">
                🗺 Map view
              </button>
            </div>
          </div>

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              Failed to load properties. Please try again.
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
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
                <div className="grid grid-cols-2 gap-4">
                  {properties.map((p, i) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                      isSaved={savedIds.includes(p.id)}
                      onSave={() => toggleSaved(p.id)}
                      onClick={() => navigate(`/properties/${p.id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Property Card 
function PropertyCard({ property, gradient, isSaved, onSave, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden cursor-pointer hover:border-[#b2c5ff] transition-colors"
    >
      <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
        {property.featured && (
          <span className="absolute top-2 left-2 bg-[#0053cc]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            FEATURED
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onSave() }}
          className="absolute top-2 right-2 w-[26px] h-[26px] bg-white/90 rounded-full flex items-center justify-center text-xs"
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
      <div className="p-3">
        <div className="text-[10px] font-bold tracking-widest text-[#727787] uppercase mb-1">
          {property.type} · {property.bedrooms}BHK
        </div>
        <div className="text-[13px] font-semibold text-[#191b24] mb-0.5">{property.title}</div>
        <div className="text-[11px] text-[#727787] mb-2">📍 {property.city} · {property.locality}</div>
        <div className="flex items-center justify-between">
          <div className="text-[14px] font-bold text-[#0053cc]">
            {formatINR(property.rent)}<span className="text-[10px] font-normal text-[#727787]">/mo</span>
          </div>
          {property.rating && (
            <span className="text-[11px] text-[#424655] bg-[#f2f3ff] px-2 py-0.5 rounded-full font-semibold">
              ★ {property.rating}
            </span>
          )}
        </div>
        {property.amenities?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {property.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] bg-[#f2f3ff] text-[#0040a1] px-1.5 py-0.5 rounded-full font-semibold">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-[11px] font-bold tracking-widest text-[#727787] uppercase mb-2">{title}</h3>
      {children}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" stroke="#727787" strokeWidth="2"/>
      <path d="m21 21-4-4" stroke="#727787" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}