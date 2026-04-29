import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURED_PROPERTIES = [
  {
    id: 1, type: 'Apartment', title: 'Modern 2BHK in Indiranagar',
    city: 'Bangalore, Karnataka', price: 22000, rating: 4.8,
    badge: 'FEATURED', badgeColor: '#1558c0', available: true,
    bg: 'bg-blue-100', svgFill: ['#dbeafe','#93c5fd','#60a5fa','#3b82f6','#bfdbfe'],
  },
  {
    id: 2, type: 'House', title: 'Spacious 3BHK with garden',
    city: 'Pune, Maharashtra', price: 35000, rating: 4.6,
    available: false, availableDate: 'Sep 2025',
    bg: 'bg-sky-100', svgFill: ['#e0f2fe','#7dd3fc','#38bdf8','#0284c7','#bae6fd'],
  },
  {
    id: 3, type: 'Studio', title: 'Cozy studio near IT park',
    city: 'Hyderabad, Telangana', price: 12500, rating: 4.5,
    badge: 'NEW', badgeColor: '#0f766e', available: true,
    bg: 'bg-green-100', svgFill: ['#dcfce7','#86efac','#4ade80','#16a34a','#a7f3d0'],
  },
  {
    id: 4, type: 'Apartment', title: 'Luxury 1BHK sea view',
    city: 'Mumbai, Maharashtra', price: 48000, rating: 4.9,
    available: false, availableDate: 'Oct 2025',
    bg: 'bg-violet-100', svgFill: ['#ede9fe','#c4b5fd','#a78bfa','#7c3aed','#ddd6fe'],
  },
  {
    id: 5, type: 'Villa', title: 'Independent villa with pool',
    city: 'Chennai, Tamil Nadu', price: 65000, rating: 4.7,
    badge: 'VERIFIED', badgeColor: '#1d7d4a', available: true, saved: true,
    bg: 'bg-pink-100', svgFill: ['#fce7f3','#f9a8d4','#ec4899','#be185d','#fbcfe8'],
  },
  {
    id: 6, type: 'Apartment', title: 'Compact 1BHK near MG Road',
    city: 'Bangalore, Karnataka', price: 16000, rating: 4.4,
    available: false, availableDate: 'Aug 2025',
    bg: 'bg-orange-100', svgFill: ['#fff7ed','#fed7aa','#fb923c','#c2410c','#fdba74'],
  },
]

const HOW_STEPS = [
  {
    num: '01', title: 'Search and discover',
    desc: 'Filter by location, price, type and amenities. Every listing is verified before it goes live.',
  },
  {
    num: '02', title: 'Request a booking',
    desc: 'Send a booking request with your move-in date and duration. No hidden fees or surprises.',
  },
  {
    num: '03', title: 'Move in with confidence',
    desc: 'Owner confirms, you\'re all set. Track your booking status in real time from your dashboard.',
  },
]

const QUICK_CHIPS = ['All', 'Furnished', 'Pet friendly', '2+ BHK', 'Near metro']

const STATS = [
  { num: '4,200+', label: 'Active listings' },
  { num: '18,500+', label: 'Happy renters' },
  { num: '97%', label: 'Verified properties' },
  { num: '24 hrs', label: 'Avg response time' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [search,       setSearch]       = useState('')
  const [searchType,   setSearchType]   = useState('')
  const [searchBudget, setSearchBudget] = useState('')
  const [activeChip,   setActiveChip]   = useState('All')
  const [savedIds,     setSavedIds]     = useState([5])

  function handleSearch() {
    const params = new URLSearchParams()
    if (search)       params.set('search', search)
    if (searchType)   params.set('type', searchType)
    if (searchBudget) params.set('maxPrice', searchBudget)
    navigate(`/properties?${params.toString()}`)
  }

  function toggleSave(id) {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function goToDashboard() {
    if (!user) return navigate('/auth')
    if (user.role === 'Admin')  return navigate('/admin')
    if (user.role === 'Owner')  return navigate('/owner/properties')
    navigate('/properties')
  }

  return (
    <div className="bg-[#f8faff] min-h-screen">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 h-[62px] sticky top-0 z-20">
        <span className="text-[19px] font-bold text-[#1558c0] tracking-tight">
          Estates<span className="text-[#1e293b]">.</span>
        </span>

        <div className="flex items-center gap-7">
          {['Browse', 'How it works', 'List property', 'Help'].map(link => (
            <button
              key={link}
              onClick={() => {
                if (link === 'Browse')        navigate('/properties')
                if (link === 'List property') navigate(user ? '/owner/properties/add' : '/auth')
              }}
              className="text-[14px] text-[#64748b] hover:text-[#1558c0] transition-colors font-medium"
            >
              {link}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <button
              onClick={goToDashboard}
              className="bg-[#1558c0] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#1248a8] transition-colors"
            >
              Go to dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="bg-white border-[1.5px] border-[#1558c0] text-[#1558c0] px-5 py-[7px] rounded-lg text-[13px] font-semibold hover:bg-[#eef4ff] transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="bg-[#1558c0] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#1248a8] transition-colors"
              >
                Sign up free
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="bg-[#eef4ff] grid items-center overflow-hidden relative"
        style={{ gridTemplateColumns: '1.15fr 0.85fr', minHeight: '380px', padding: '0 32px' }}
      >
        {/* Left */}
        <div className="py-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#dbeafe] border border-[#bfdbfe] text-[#1558c0] text-[11px] font-bold tracking-widest px-3.5 py-1.5 rounded-full mb-5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1558c0]" />
            Trusted by 18,000+ renters across India
          </div>

          <h1 className="text-[42px] font-bold text-[#0f172a] leading-[1.12] tracking-tight mb-3">
            Find your <span className="text-[#1558c0]">perfect</span><br />rental home today
          </h1>
          <p className="text-[15px] text-[#475569] mb-6 leading-relaxed max-w-[500px]">
            Verified listings, transparent pricing, zero brokerage. Browse thousands of homes
            from trusted owners — all in one place.
          </p>

          {/* Search card */}
          <div className="bg-white rounded-2xl border border-white/80 p-5 max-w-[540px] shadow-[0_18px_40px_rgba(21,88,192,0.08)]">
            <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2.5">
              Where are you looking?
            </div>

            {/* Search row */}
            <div className="flex border border-[#e2e8f0] rounded-xl overflow-hidden mb-3">
              <SearchField
                label="Location"
                value={search}
                placeholder="City or area..."
                onChange={e => setSearch(e.target.value)}
                border
              />
              <SearchField
                label="Type"
                isSelect
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                options={['Any type', 'Apartment', 'House', 'Studio', 'Villa']}
                border
              />
              <SearchField
                label="Budget"
                isSelect
                value={searchBudget}
                onChange={e => setSearchBudget(e.target.value)}
                options={['Any price', '10000', '20000', '35000', '50000']}
                optionLabels={['Any price', 'Up to ₹10k', 'Up to ₹20k', 'Up to ₹35k', 'Up to ₹50k']}
              />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-[#1558c0] text-white py-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#1248a8] transition-colors"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
                <circle cx="6.5" cy="6.5" r="5" stroke="#fff" strokeWidth="1.6"/>
                <path d="M10.5 10.5L14 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Search properties
            </button>

            {/* Quick chips */}
            <div className="flex gap-1.5 flex-wrap mt-3">
              {QUICK_CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveChip(c)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    activeChip === c
                      ? 'bg-[#dbeafe] border-[#bfdbfe] text-[#1558c0]'
                      : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#475569] hover:border-[#bfdbfe]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Trust row */}
          <div className="flex gap-5 items-center mt-4">
            {['No hidden fees', 'Verified owners'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-[18px] h-[18px] bg-[#d1fae5] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[12px] text-[#475569] font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero illustration + floating cards */}
        <div className="flex items-center justify-end h-full py-6 pr-2">
          <div className="relative inline-block">
            {/* Main frame */}
            <div className="w-[292px] h-[348px] rounded-[20px] bg-[#c7deff] border border-[#bfdbfe] overflow-hidden shadow-[0_18px_40px_rgba(59,130,246,0.12)]">
              <svg viewBox="0 0 280 340" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <rect width="280" height="340" fill="#c7deff"/>
                <rect x="0" y="200" width="280" height="140" fill="#a8c8f0"/>
                <rect x="30" y="110" width="220" height="190" rx="6" fill="#7bacd8"/>
                <rect x="50" y="80" width="180" height="40" rx="4" fill="#5a90cc"/>
                <polygon points="30,110 140,50 250,110" fill="#3a74bb"/>
                <rect x="110" y="160" width="60" height="90" rx="3" fill="#2a5ca0"/>
                <rect x="45" y="155" width="55" height="55" rx="3" fill="#2a5ca0"/>
                <rect x="180" y="155" width="55" height="55" rx="3" fill="#2a5ca0"/>
                <rect x="60" y="220" width="30" height="30" rx="2" fill="#1a4a90"/>
                <rect x="190" y="220" width="30" height="30" rx="2" fill="#1a4a90"/>
                <rect x="0" y="290" width="280" height="50" fill="#8ab8e0"/>
                <rect x="20" y="270" width="60" height="70" rx="3" fill="#6898c8"/>
                <rect x="200" y="270" width="60" height="70" rx="3" fill="#6898c8"/>
                <circle cx="230" cy="70" r="28" fill="#b5d4f4"/>
                <circle cx="230" cy="70" r="18" fill="#dbeafe"/>
                <rect x="40" y="325" width="200" height="15" fill="#70a8d8"/>
              </svg>
            </div>

            {/* Floating card 1 — bottom left */}
            <div className="absolute -bottom-2 -left-6 bg-white border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 min-w-[160px] shadow-md">
              <div className="text-[10px] text-[#64748b] font-semibold tracking-widest uppercase mb-0.5">Avg. monthly rent</div>
              <div className="text-[15px] font-bold text-[#1558c0]">₹24,500</div>
              <div className="text-[11px] text-[#94a3b8] mt-0.5">Bengaluru · 2 BHK</div>
            </div>

            {/* Floating card 2 — top right */}
            <div className="absolute top-10 -right-5 bg-white border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 min-w-[130px] shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-[12px] text-[#15803d] font-semibold">Available now</span>
              </div>
              <div className="text-[12px] font-bold text-[#1e293b]">3,240 listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-t border-b border-[#e2e8f0] grid grid-cols-4">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`py-[18px] text-center ${i < 3 ? 'border-r border-[#e2e8f0]' : ''}`}
          >
            <div className="text-[20px] font-bold text-[#1558c0] tracking-tight">{s.num}</div>
            <div className="text-[11px] text-[#94a3b8] mt-0.5 font-medium uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Featured listings ── */}
      <div className="px-8 pt-7 pb-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Featured listings</h2>
          <button
            onClick={() => navigate('/properties')}
            className="text-[13px] text-[#1558c0] font-semibold hover:underline"
          >
            View all listings →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {FEATURED_PROPERTIES.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              isSaved={savedIds.includes(p.id)}
              onSave={() => toggleSave(p.id)}
              onClick={() => navigate(user ? `/properties/${p.id}` : '/auth')}
            />
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-[#f8faff] border-t border-b border-[#e2e8f0] px-8 py-8 mt-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">How it works</h2>
          <button className="text-[13px] text-[#1558c0] font-semibold hover:underline">Learn more →</button>
        </div>
        <p className="text-[13px] text-[#64748b] mb-5">Simple, transparent, and built for India's rental market</p>

        <div className="grid grid-cols-3 gap-5">
          {HOW_STEPS.map(s => (
            <div key={s.num} className="bg-white border border-[#e2e8f0] rounded-xl p-5">
              <div className="w-[34px] h-[34px] bg-[#dbeafe] rounded-lg flex items-center justify-center text-[14px] font-bold text-[#1558c0] mb-3.5">
                {s.num}
              </div>
              <h3 className="text-[14px] font-semibold text-[#0f172a] mb-1.5">{s.title}</h3>
              <p className="text-[12px] text-[#64748b] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA strip ── */}
      <div className="mx-8 my-7 bg-[#eef4ff] border border-[#bfdbfe] rounded-2xl px-8 py-7 flex items-center justify-between">
        <div>
          <h3 className="text-[17px] font-bold text-[#0f172a] mb-1.5">Own a property? Start earning today.</h3>
          <p className="text-[13px] text-[#475569]">List your property for free — reach thousands of verified renters instantly.</p>
          <div className="flex gap-2 mt-2.5">
            {['Free listing', 'Zero commission', 'Instant visibility'].map(b => (
              <span key={b} className="text-[11px] bg-[#dbeafe] border border-[#bfdbfe] text-[#1558c0] font-semibold px-2.5 py-1 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate(user?.role === 'Owner' ? '/owner/properties/add' : '/auth')}
          className="bg-[#1558c0] text-white px-7 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-[#1248a8] transition-colors whitespace-nowrap"
        >
          List your property →
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-[#e2e8f0] px-8 py-5 flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#1558c0]">Estates.</span>
        <div className="flex gap-5">
          {['About', 'Privacy', 'Terms', 'Support', 'Blog'].map(l => (
            <button key={l} className="text-[12px] text-[#94a3b8] hover:text-[#64748b] transition-colors">{l}</button>
          ))}
        </div>
        <span className="text-[11px] text-[#cbd5e1]">© 2025 Estates. All rights reserved.</span>
      </footer>
    </div>
  )
}

// ── Property card ──
function PropertyCard({ property: p, isSaved, onSave, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden cursor-pointer hover:border-[#bfdbfe] hover:shadow-sm transition-all"
    >
      {/* Image area */}
      <div className={`h-[138px] relative overflow-hidden ${p.bg}`}>
        <HouseIllustration fills={p.svgFill} />
        {p.badge && (
          <span
            className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide"
            style={{ background: p.badgeColor }}
          >
            {p.badge}
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onSave() }}
          className="absolute top-2.5 right-2.5 w-[26px] h-[26px] bg-white/95 rounded-full flex items-center justify-center text-[13px] border border-[#e2e8f0] hover:scale-110 transition-transform"
          style={{ color: isSaved ? '#e85d8a' : '#64748b' }}
        >
          {isSaved ? '♥' : '♡'}
        </button>
        <span className="absolute bottom-2.5 left-2.5 bg-white/95 border border-[#fde68a] text-[#b45309] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
          ★ {p.rating}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase mb-0.5">{p.type}</div>
        <div className="text-[13px] font-semibold text-[#1e293b] mb-0.5 leading-snug">{p.title}</div>
        <div className="flex items-center gap-1 text-[11px] text-[#94a3b8] mb-2.5">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
            <path d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5.5 3 5.5S8 6.25 8 4C8 2.34 6.66 1 5 1z" fill="#94a3b8"/>
          </svg>
          {p.city}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-[#1558c0]">
            ₹{p.price.toLocaleString('en-IN')}<span className="text-[11px] font-normal text-[#94a3b8]">/mo</span>
          </span>
          {p.available ? (
            <span className="text-[10px] text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full font-semibold">Available now</span>
          ) : (
            <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full font-semibold">{p.availableDate}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Generic house illustration ──
function HouseIllustration({ fills = [] }) {
  const [bg, wall, roof, door, ground] = fills
  return (
    <svg width="100%" height="138" viewBox="0 0 240 138" preserveAspectRatio="xMidYMid slice">
      <rect width="240" height="138" fill={bg || '#dbeafe'}/>
      <rect x="40" y="40" width="160" height="90" rx="4" fill={wall || '#93c5fd'}/>
      <polygon points="40,40 120,8 200,40" fill={roof || '#60a5fa'}/>
      <rect x="90" y="65" width="60" height="65" rx="2" fill={door || '#3b82f6'}/>
      <rect x="46" y="60" width="38" height="35" rx="2" fill={door || '#3b82f6'}/>
      <rect x="156" y="60" width="38" height="35" rx="2" fill={door || '#3b82f6'}/>
      <rect x="0" y="120" width="240" height="18" fill={ground || '#bfdbfe'}/>
    </svg>
  )
}

// ── Search field ──
function SearchField({ label, value, onChange, placeholder, isSelect, options = [], optionLabels, border }) {
  return (
    <div className={`flex flex-col px-3.5 py-2.5 flex-1 cursor-pointer ${border ? 'border-r border-[#e2e8f0]' : ''}`}>
      <span className="text-[10px] font-bold tracking-widest text-[#1558c0] uppercase mb-1">{label}</span>
      {isSelect ? (
        <select
          value={value} onChange={onChange}
          className="text-[13px] text-[#1e293b] font-medium bg-transparent outline-none cursor-pointer font-[inherit] border-none p-0"
        >
          {options.map((o, i) => (
            <option key={o} value={o}>{optionLabels ? optionLabels[i] : o}</option>
          ))}
        </select>
      ) : (
        <input
          value={value} onChange={onChange}
          placeholder={placeholder}
          className="text-[13px] text-[#1e293b] placeholder:text-[#94a3b8] bg-transparent outline-none border-none p-0 font-[inherit]"
        />
      )}
    </div>
  )
}
