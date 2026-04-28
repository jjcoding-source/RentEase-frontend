import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProperty } from '../../hooks/useProperties'
import { useCreateBooking } from '../../hooks/useBookings'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatCurrency'

const DURATION_OPTIONS = [
  { value: 3,  label: '3 mo',  sub: 'Short stay' },
  { value: 6,  label: '6 mo',  sub: 'Mid-term' },
  { value: 11, label: '11 mo', sub: 'Standard' },
  { value: 24, label: '24 mo', sub: 'Long-term' },
]

export default function BookingRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: property, isLoading } = useProperty(id)
  const { mutateAsync: createBooking, isPending } = useCreateBooking()

  const [form, setForm] = useState({
    moveIn:      '',
    moveOut:     '',
    duration:    11,
    name:        user?.name  || '',
    phone:       '',
    email:       user?.email || '',
    message:     '',
    occupants:   '1 person',
    parking:     'No',
    agreeTerms:  false,
    agreeAccurate: false,
    agreeVerify: false,
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function setDuration(val) {
    setForm(prev => ({ ...prev, duration: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.moveIn)       return setError('Please select a move-in date.')
    if (!form.agreeTerms || !form.agreeAccurate)
      return setError('Please agree to all required terms.')

    try {
      await createBooking({
        propertyId:  id,
        moveIn:      form.moveIn,
        moveOut:     form.moveOut,
        duration:    form.duration,
        message:     form.message,
        occupants:   form.occupants,
        parking:     form.parking,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    }
  }

  if (success) return <SuccessScreen onBack={() => navigate('/properties')} />
  if (isLoading) return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center text-[#1558c0] font-semibold animate-pulse">
      Loading...
    </div>
  )

  const deposit = property ? property.rent * 2 : 0
  const total   = property ? property.rent * form.duration + deposit : 0

  return (
    <div className="bg-[#f8faff] min-h-screen">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 h-[54px] sticky top-0 z-10">
        <div className="flex items-center gap-3.5">
          <span className="text-[17px] font-bold text-[#1558c0]">Estates<span className="text-[#1e293b]">.</span></span>
          <button
            onClick={() => navigate(`/properties/${id}`)}
            className="flex items-center gap-1.5 text-[13px] text-[#64748b] font-medium hover:text-[#334155]"
          >
            ← Back to property
          </button>
        </div>
        <div className="w-7 h-7 rounded-full bg-[#dbeafe] flex items-center justify-center text-[10px] font-bold text-[#1558c0]">
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
      </nav>

      <div className="grid gap-5 px-6 py-6 max-w-5xl mx-auto" style={{ gridTemplateColumns: '1fr 300px' }}>

        {/* ── Left: Form ── */}
        <form onSubmit={handleSubmit}>

          {/* Steps indicator */}
          <div className="flex items-center gap-0 mb-6">
            <Step num={1} label="Property"       state="done" />
            <StepLine done />
            <Step num={2} label="Booking details" state="active" />
            <StepLine />
            <Step num={3} label="Review"          state="pending" />
            <StepLine />
            <Step num={4} label="Confirm"         state="pending" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-lg px-3 py-2 mb-4 font-medium">
              {error}
            </div>
          )}

          {/* Rental dates */}
          <FormCard title="Rental dates" iconBg="#dbeafe">
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <FormField label="Move-in date">
                <input type="date" name="moveIn" value={form.moveIn} onChange={handleChange} />
              </FormField>
              <FormField label="Move-out date">
                <input type="date" name="moveOut" value={form.moveOut} onChange={handleChange} />
              </FormField>
            </div>
            <FormField label="Rental duration">
              <div className="grid grid-cols-4 gap-1.5">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.value} type="button"
                    onClick={() => setDuration(d.value)}
                    className={`border rounded-lg py-2 text-center transition-colors ${
                      form.duration === d.value
                        ? 'border-[#1558c0] bg-[#eef4ff]'
                        : 'border-[#e2e8f0] bg-[#f8faff]'
                    }`}
                  >
                    <div className={`text-[13px] font-bold ${form.duration === d.value ? 'text-[#1558c0]' : 'text-[#334155]'}`}>
                      {d.label}
                    </div>
                    <div className="text-[10px] text-[#94a3b8]">{d.sub}</div>
                  </button>
                ))}
              </div>
            </FormField>
          </FormCard>

          {/* Your details */}
          <FormCard title="Your details" iconBg="#dcfce7">
            <div className="grid grid-cols-2 gap-2.5 mb-0">
              <FormField label="Full name">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" />
              </FormField>
              <FormField label="Phone">
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </FormField>
            </div>
            <FormField label="Email">
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </FormField>
            <FormField label="Message to owner">
              <textarea
                name="message" value={form.message} onChange={handleChange}
                rows={3} placeholder="Introduce yourself briefly..."
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-[13px] text-[#1e293b] bg-[#f8faff] outline-none resize-none font-[inherit] leading-relaxed"
              />
            </FormField>
          </FormCard>

          {/* Preferences */}
          <FormCard title="Preferences & requirements" iconBg="#fce7f3">
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <FormField label="Number of occupants">
                <select name="occupants" value={form.occupants} onChange={handleChange}>
                  <option>1 person</option>
                  <option>2 people</option>
                  <option>3 people</option>
                  <option>4+ people</option>
                </select>
              </FormField>
              <FormField label="Parking needed">
                <select name="parking" value={form.parking} onChange={handleChange}>
                  <option value="Yes — 1 spot">Yes — 1 spot</option>
                  <option value="No">No</option>
                </select>
              </FormField>
            </div>

            <div className="mb-1.5">
              <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-2">
                I agree to the following
              </label>
              <div className="flex flex-col gap-2">
                <CheckItem
                  name="agreeAccurate" checked={form.agreeAccurate}
                  onChange={handleChange}
                  label="I confirm all details provided are accurate"
                />
                <CheckItem
                  name="agreeTerms" checked={form.agreeTerms}
                  onChange={handleChange}
                  label="I agree to the rental terms and no-subletting policy"
                />
                <CheckItem
                  name="agreeVerify" checked={form.agreeVerify}
                  onChange={handleChange}
                  label="I consent to background verification if requested"
                />
              </div>
            </div>
          </FormCard>

          <button
            type="submit" disabled={isPending}
            className="w-full bg-[#1558c0] text-white py-3.5 rounded-lg text-[14px] font-bold hover:bg-[#1248a8] transition-colors disabled:opacity-60 mt-1"
          >
            {isPending ? 'Sending request...' : 'Send booking request'}
          </button>
          <p className="text-[11px] text-[#94a3b8] text-center mt-2.5">
            Your request will be sent to the owner. No payment is charged at this stage.
          </p>
        </form>

        {/* ── Right: Summary ── */}
        {property && (
          <div>
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 sticky top-20">
              <div className="h-32 bg-gradient-to-br from-blue-200 to-blue-700 rounded-lg mb-4" />
              <span className="bg-[#1558c0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">FEATURED</span>
              <div className="text-[13px] font-bold text-[#1e293b] mt-1.5 mb-0.5">{property.title}</div>
              <div className="text-[11px] text-[#94a3b8] mb-3">{property.city} · Verified owner</div>

              <div className="flex gap-2.5 pb-3 border-b border-[#f1f5f9] mb-3 text-[11px] text-[#64748b]">
                <span>{property.bedrooms} beds</span>
                <span>·</span>
                <span>{property.bathrooms} baths</span>
                <span>·</span>
                <span>{property.area} sqft</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <SummaryRow label="Monthly rent"      value={formatINR(property.rent)} />
                <SummaryRow label="Duration"          value={`${form.duration} months`} />
                <SummaryRow label="Security deposit"  value={formatINR(deposit)} />
                <SummaryRow label="Brokerage"         value="₹0" valueClass="text-[#16a34a]" />
                <div className="flex justify-between pt-2.5 border-t border-[#e2e8f0] mt-1">
                  <span className="text-[13px] font-bold text-[#0f172a]">Total commitment</span>
                  <span className="text-[13px] font-bold text-[#1558c0]">{formatINR(total)}</span>
                </div>
              </div>

              <div className="bg-[#eef4ff] border border-[#bfdbfe] rounded-lg p-3 mt-3">
                <p className="text-[11px] text-[#1558c0] leading-relaxed font-medium">
                  Your booking request status will be <strong>Pending</strong> until the owner approves.
                  You'll receive an email notification.
                </p>
              </div>

              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1.5 bg-[#fef9c3] border border-[#fde68a] text-[#b45309] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#b45309]" />
                  Awaiting approval
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Step({ num, label, state }) {
  const circle =
    state === 'done'   ? 'bg-[#dcfce7] border border-[#bbf7d0]' :
    state === 'active' ? 'bg-[#1558c0] text-white' :
                         'bg-[#f8faff] border border-[#e2e8f0]'
  const labelClass = state === 'pending' ? 'text-[#94a3b8]' : 'text-[#1e293b]'
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${circle}`}>
        {state === 'done'
          ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : num}
      </div>
      <span className={`text-[12px] font-semibold ${labelClass}`}>{label}</span>
    </div>
  )
}

function StepLine({ done }) {
  return <div className={`flex-1 h-px mx-1.5 ${done ? 'bg-[#bbf7d0]' : 'bg-[#e2e8f0]'}`} />
}

function FormCard({ title, iconBg, children }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-[18px] mb-4">
      <div className="text-[13px] font-bold text-[#0f172a] mb-3.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: iconBg }}>
          <span className="text-[10px]">●</span>
        </div>
        {title}
      </div>
      {children}
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">{label}</label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-[#e2e8f0] [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[13px] [&_input]:text-[#1e293b] [&_input]:bg-[#f8faff] [&_input]:outline-none [&_input]:font-[inherit] [&_select]:w-full [&_select]:border [&_select]:border-[#e2e8f0] [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-[13px] [&_select]:text-[#1e293b] [&_select]:bg-[#f8faff] [&_select]:outline-none [&_select]:font-[inherit]">
        {children}
      </div>
    </div>
  )
}

function CheckItem({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="accent-[#1558c0] w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-[12px] text-[#475569]">{label}</span>
    </label>
  )
}

function SummaryRow({ label, value, valueClass = 'text-[#1e293b]' }) {
  return (
    <div className="flex justify-between">
      <span className="text-[12px] text-[#64748b]">{label}</span>
      <strong className={`text-[12px] font-semibold ${valueClass}`}>{value}</strong>
    </div>
  )
}

function SuccessScreen({ onBack }) {
  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 max-w-md text-center shadow-sm">
        <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14l6 6 12-12" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-[#0f172a] mb-2">Booking request sent!</h2>
        <p className="text-[13px] text-[#475569] leading-relaxed mb-6">
          Your request has been sent to the owner. You'll receive an email once they respond.
          No payment has been charged.
        </p>
        <button
          onClick={onBack}
          className="bg-[#1558c0] text-white px-6 py-2.5 rounded-lg text-[14px] font-bold hover:bg-[#1248a8] transition-colors"
        >
          Browse more properties
        </button>
      </div>
    </div>
  )
}