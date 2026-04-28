import { useParams, useNavigate } from 'react-router-dom'
import { useProperty } from '../../hooks/useProperties'
import { useState } from 'react'
import { formatINR } from '../../utils/formatCurrency'

const DURATION_OPTIONS = [
  { value: 6,  label: '6 mo',  sub: 'Mid-term' },
  { value: 11, label: '11 mo', sub: 'Standard' },
  { value: 12, label: '12 mo', sub: '1 year' },
  { value: 24, label: '24 mo', sub: 'Long-term' },
]

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: property, isLoading, isError } = useProperty(id)

  const [moveIn, setMoveIn]     = useState('')
  const [duration, setDuration] = useState(11)
  const [message, setMessage]   = useState('')

  if (isLoading) return <PageShell><LoadingState /></PageShell>
  if (isError || !property) return <PageShell><ErrorState /></PageShell>

  const deposit = property.rent * 2

  return (
    <div className="bg-[#f8faff] min-h-screen">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 h-[54px] sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-[17px] font-bold text-[#1558c0]">Estates<span className="text-[#1e293b]">.</span></span>
          <button
            onClick={() => navigate('/properties')}
            className="flex items-center gap-1.5 text-[13px] text-[#64748b] font-medium hover:text-[#334155]"
          >
            <BackArrow /> Back to search
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-[#e2e8f0] rounded-lg px-3.5 py-1.5 text-[12px] text-[#334155] font-semibold bg-white hover:bg-gray-50">Share</button>
          <button className="border border-[#e2e8f0] rounded-lg px-3.5 py-1.5 text-[12px] text-[#334155] font-semibold bg-white hover:bg-gray-50">Save</button>
        </div>
      </nav>

      {/* ── Gallery ── */}
      <div className="grid gap-0.5 h-[300px]" style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}>
        <div className="row-span-2 bg-gradient-to-br from-blue-200 to-blue-700 relative">
          <span className="absolute top-2.5 left-2.5 bg-[#1558c0] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FEATURED</span>
          <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/95 rounded-full flex items-center justify-center text-[13px] cursor-pointer border border-[#e2e8f0]">♡</span>
          <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-[11px] font-bold px-2.5 py-1 rounded-md text-[#334155] border border-[#e2e8f0] cursor-pointer">+6 photos</span>
        </div>
        <div className="bg-gradient-to-br from-sky-100 to-sky-500" />
        <div className="bg-gradient-to-br from-green-100 to-green-500" />
      </div>

      {/* ── Body ── */}
      <div className="grid gap-5 px-6 py-5 max-w-6xl mx-auto" style={{ gridTemplateColumns: '1fr 280px' }}>

        {/* Left */}
        <div>
          <h1 className="text-[20px] font-bold text-[#0f172a] tracking-tight mb-1.5">{property.title}</h1>

          <div className="flex items-center gap-1.5 mb-3">
            <LocationPin />
            <span className="text-[13px] text-[#64748b]">{property.address}, {property.city}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#b45309] text-[13px] font-bold">{'★'.repeat(Math.round(property.rating || 5))}</span>
            <span className="text-[13px] font-bold text-[#1e293b]">{property.rating || '4.8'}</span>
            <span className="text-[12px] text-[#94a3b8]">· {property.reviewCount || 0} reviews</span>
            <span className="text-[12px] text-[#64748b]">
              · Listed by <span className="text-[#1558c0] font-semibold cursor-pointer">{property.ownerName}</span>
            </span>
          </div>

          {/* Meta pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[
              { val: property.bedrooms,  label: 'Bedrooms' },
              { val: property.bathrooms, label: 'Bathrooms' },
              { val: property.area,      label: 'sqft' },
              { val: property.floor,     label: 'Floor' },
              { val: property.availableFrom ? new Date(property.availableFrom).toLocaleString('default', { month: 'short' }) : '—', label: 'Available' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-[#f8faff] border border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-center min-w-[70px]">
                <div className="text-[14px] font-bold text-[#1558c0]">{val}</div>
                <div className="text-[10px] text-[#94a3b8] mt-0.5 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* About */}
          <Section title="About this property">
            <p className="text-[13px] text-[#475569] leading-relaxed">{property.description}</p>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <div className="grid grid-cols-3 gap-2">
              {(property.amenities || []).map(a => (
                <div key={a} className="flex items-center gap-2 bg-[#f8faff] border border-[#e2e8f0] rounded-lg px-2.5 py-2">
                  <div className="w-6 h-6 rounded-md bg-[#dbeafe] flex items-center justify-center text-[10px]">✓</div>
                  <span className="text-[11px] text-[#475569] font-semibold">{a}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Map placeholder */}
          <Section title="Location">
            <div className="bg-[#dbeafe] border border-[#bfdbfe] rounded-lg h-32 flex items-center justify-center text-[13px] text-[#64748b] font-medium">
              🗺 Map view — {property.address}
            </div>
          </Section>

          {/* Reviews */}
          {property.reviews?.length > 0 && (
            <Section title="Reviews">
              <div className="flex flex-col gap-3">
                {property.reviews.map((rev, i) => (
                  <div key={i} className="pb-3 border-b border-[#f1f5f9] last:border-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-[#1558c0] text-white flex items-center justify-center text-[10px] font-bold">
                        {rev.name?.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#1e293b]">{rev.name}</div>
                        <div className="text-[11px] text-[#94a3b8]">{rev.date} · <span className="text-[#b45309]">{'★'.repeat(rev.rating)}</span></div>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#475569] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Booking card  */}
        <div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-[18px] sticky top-20">
            <div className="text-[22px] font-bold text-[#1558c0]">
              {formatINR(property.rent)} <span className="text-[13px] font-normal text-[#94a3b8]">/ month</span>
            </div>
            <div className="text-[11px] text-[#64748b] mt-0.5">+ {formatINR(deposit)} deposit (2 months)</div>

            <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-[11px] font-bold px-2.5 py-1 rounded-full my-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              Available from {property.availableFrom
                ? new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Now'}
            </div>

            <div className="mb-3">
              <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">Move-in date</label>
              <input
                type="date" value={moveIn}
                onChange={e => setMoveIn(e.target.value)}
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] text-[#1e293b] bg-[#f8faff] outline-none"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">Duration</label>
              <div className="grid grid-cols-2 gap-1.5">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`border rounded-lg py-2 text-center transition-colors ${
                      duration === d.value
                        ? 'border-[#1558c0] bg-[#eef4ff]'
                        : 'border-[#e2e8f0] bg-[#f8faff]'
                    }`}
                  >
                    <div className={`text-[13px] font-bold ${duration === d.value ? 'text-[#1558c0]' : 'text-[#334155]'}`}>{d.label}</div>
                    <div className="text-[10px] text-[#94a3b8]">{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">Message to owner</label>
              <input
                placeholder="Briefly introduce yourself..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-[13px] text-[#1e293b] bg-[#f8faff] outline-none"
              />
            </div>

            <button
              onClick={() => navigate(`/properties/${id}/book`)}
              className="w-full bg-[#1558c0] text-white py-3 rounded-lg text-[14px] font-bold hover:bg-[#1248a8] transition-colors"
            >
              Send booking request
            </button>

            {/* Price breakdown */}
            <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-col gap-1.5">
              <PriceRow label="Monthly rent" value={formatINR(property.rent)} />
              <PriceRow label="Security deposit (2 mo)" value={formatINR(deposit)} />
              <PriceRow label="Platform fee" value="₹0" />
              <div className="flex justify-between pt-2.5 border-t border-[#e2e8f0] mt-1">
                <span className="text-[13px] font-bold text-[#0f172a]">Due at move-in</span>
                <span className="text-[13px] font-bold text-[#1558c0]">{formatINR(property.rent + deposit)}</span>
              </div>
            </div>

            {/* Owner mini card */}
            <div className="flex items-center gap-2.5 bg-[#f8faff] border border-[#e2e8f0] rounded-lg p-3 mt-3">
              <div className="w-9 h-9 rounded-full bg-[#1558c0] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                {property.ownerName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#1e293b]">{property.ownerName}</div>
                <div className="text-[11px] text-[#94a3b8]">Verified owner</div>
                <div className="text-[11px] text-[#1558c0] font-semibold cursor-pointer mt-0.5">Contact owner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-[13px] font-bold text-[#0f172a] mb-2.5 pt-4 border-t border-[#f1f5f9]">{title}</div>
      {children}
    </div>
  )
}

function PriceRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[12px] text-[#64748b]">{label}</span>
      <strong className="text-[12px] text-[#1e293b] font-semibold">{value}</strong>
    </div>
  )
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2L4 7l5 5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function LocationPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1C4.57 1 3 2.57 3 4.5c0 2.625 3.5 7.5 3.5 7.5S10 7.125 10 4.5C10 2.57 8.43 1 6.5 1z" fill="#94a3b8"/>
    </svg>
  )
}

function PageShell({ children }) {
  return <div className="bg-[#f8faff] min-h-screen flex items-center justify-center">{children}</div>
}

function LoadingState() {
  return <div className="text-[#1558c0] font-semibold animate-pulse">Loading property...</div>
}

function ErrorState() {
  return <div className="text-red-500 font-semibold">Property not found.</div>
}