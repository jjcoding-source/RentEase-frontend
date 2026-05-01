import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperty, useCreateProperty, useUpdateProperty } from '../../hooks/useProperties'
import { formatINR } from '../../utils/formatCurrency'

const STEPS = ['Basic info', 'Location', 'Photos', 'Amenities', 'Pricing & availability']

const PROPERTY_TYPES  = ['Apartment', 'House', 'Studio', 'Villa', 'PG']
const LISTING_STATUSES = ['Active', 'Draft', 'Inactive']
const LEASE_OPTIONS   = [3, 6, 11, 12, 24]

const ALL_AMENITIES = [
  { key: 'WiFi',         emoji: '📶' },
  { key: 'Parking',      emoji: '🅿'  },
  { key: 'AC',           emoji: '❄'  },
  { key: 'Pool',         emoji: '🏊' },
  { key: 'Gym',          emoji: '🏋' },
  { key: 'Pet friendly', emoji: '🐾' },
  { key: 'Security',     emoji: '🔒' },
  { key: 'Garden',       emoji: '🌿' },
  { key: 'Power backup', emoji: '🔌' },
]

const EMPTY_FORM = {
  title:         '',
  type:          'Apartment',
  status:        'Draft',
  description:   '',
  bedrooms:      '',
  bathrooms:     '',
  area:          '',
  address:       '',
  city:          '',
  state:         '',
  pincode:       '',
  country:       'India',
  amenities:     [],
  rent:          '',
  deposit:       '',
  availableFrom: '',
  minLease:      12,
}

export default function AddEditProperty() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const isEdit     = Boolean(id)

  const { data: existing } = useProperty(id)

  const { mutateAsync: createProperty, isPending: isCreating } = useCreateProperty()
  const { mutateAsync: updateProperty, isPending: isUpdating } = useUpdateProperty(id)

  const [step,   setStep]   = useState(0)
  const [form,   setForm]   = useState(EMPTY_FORM)
  const [images, setImages] = useState([])  
  const [error,  setError]  = useState('')

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        title:         existing.title         || '',
        type:          existing.type          || 'Apartment',
        status:        existing.status        || 'Draft',
        description:   existing.description   || '',
        bedrooms:      existing.bedrooms      || '',
        bathrooms:     existing.bathrooms     || '',
        area:          existing.area          || '',
        address:       existing.address       || '',
        city:          existing.city          || '',
        state:         existing.state         || '',
        pincode:       existing.pincode       || '',
        country:       existing.country       || 'India',
        amenities:     existing.amenities     || [],
        rent:          existing.rent          || '',
        deposit:       existing.deposit       || '',
        availableFrom: existing.availableFrom || '',
        minLease:      existing.minLease      || 12,
      })
    }
  }, [existing, isEdit])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function toggleAmenity(key) {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter(a => a !== key)
        : [...prev.amenities, key],
    }))
  }

  function handleImageAdd(e) {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files].slice(0, 10))
  }

  function removeImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Checklist completion
  const checks = {
    'Basic information':  Boolean(form.title && form.type && form.description),
    'Address & location': Boolean(form.address && form.city && form.state),
    'Photos':             images.length >= 1,
    'Amenities selected': form.amenities.length > 0,
    'Pricing details':    Boolean(form.rent),
    'Availability dates': Boolean(form.availableFrom),
  }
  const allDone = Object.values(checks).every(Boolean)

  async function handleSubmit(asDraft = false) {
    setError('')
    if (!form.title)   return setError('Property title is required.')
    if (!form.address) return setError('Address is required.')
    if (!form.rent)    return setError('Rent amount is required.')

    try {
      const payload = {
        ...form,
        status: asDraft ? 'Draft' : 'Pending',
        rent:   Number(form.rent),
        deposit: Number(form.deposit),
        bedrooms:  Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area:      Number(form.area),
      }

      if (isEdit) {
        await updateProperty(payload)
      } else {
        await createProperty(payload)
      }

      navigate('/owner/properties')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save property.')
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <PageWrapper>
      {/* ── Top bar ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[21px] font-bold text-[#191b24] tracking-tight">
            {isEdit ? 'Edit property' : 'Add new property'}
          </h1>
          <p className="text-[12px] text-[#727787] mt-0.5">
            Fill in the details to list your property on RentEase
          </p>
        </div>
        <button
          onClick={() => navigate('/owner/properties')}
          className="bg-white border border-[#e6e7f4] rounded-lg px-4 py-2 text-[12px] font-semibold text-[#424655] hover:bg-gray-50 transition-colors"
        >
          ← Back to listings
        </button>
      </div>

      {/* ── Step tabs ── */}
      <div className="flex gap-1 bg-white border border-[#e6e7f4] rounded-xl p-1 mb-5">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 text-center py-2 rounded-lg text-[12px] font-semibold transition-colors ${
              i === step
                ? 'bg-[#0053cc] text-white'
                : i < step
                ? 'text-green-700 bg-green-50'
                : 'text-[#727787]'
            }`}
          >
            {i < step ? `✓ ${s}` : s}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-2.5 mb-4 font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>

        {/* ── Left: form sections ── */}
        <div className="flex flex-col gap-4">

          {/* Basic info + Location */}
          <FormSection title="Basic information" active={step === 0}>
            <FormGroup label="Property title">
              <Input name="title" value={form.title} onChange={handleChange} placeholder="Modern 2BHK in Indiranagar" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Property type">
                <Select name="type" value={form.type} onChange={handleChange}>
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Listing status">
                <Select name="status" value={form.status} onChange={handleChange}>
                  {LISTING_STATUSES.map(s => <option key={s}>{s}</option>)}
                </Select>
              </FormGroup>
            </div>
            <FormGroup label="Description">
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe the property..."
                className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none resize-none focus:border-[#006aff] focus:shadow-[0_0_0_3px_rgba(0,106,255,0.08)]"
              />
            </FormGroup>
            <div className="grid grid-cols-3 gap-2.5">
              <FormGroup label="Bedrooms">
                <Input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="2" />
              </FormGroup>
              <FormGroup label="Bathrooms">
                <Input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="2" />
              </FormGroup>
              <FormGroup label="Area (sq ft)">
                <Input name="area" type="number" value={form.area} onChange={handleChange} placeholder="1100" />
              </FormGroup>
            </div>
          </FormSection>

          <FormSection title="Location & address" active={step === 1}>
            <FormGroup label="Full address">
              <Input name="address" value={form.address} onChange={handleChange} placeholder="12th Main Rd, Indiranagar" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="City">
                <Input name="city" value={form.city} onChange={handleChange} placeholder="Bangalore" />
              </FormGroup>
              <FormGroup label="State">
                <Input name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="PIN code">
                <Input name="pincode" value={form.pincode} onChange={handleChange} placeholder="560038" />
              </FormGroup>
              <FormGroup label="Country">
                <Input name="country" value={form.country} onChange={handleChange} placeholder="India" />
              </FormGroup>
            </div>
            <div className="bg-[#e6e7f4] rounded-lg h-24 flex items-center justify-center text-[12px] text-[#424655] font-semibold mt-1 cursor-pointer hover:bg-[#d8d9f0] transition-colors">
              🗺 Click to pin location on map
            </div>
          </FormSection>

          <FormSection title="Property photos" active={step === 2}>
            <label className="block border-2 border-dashed border-[#c2c6d8] rounded-xl p-7 text-center cursor-pointer hover:border-[#006aff] hover:bg-[#f2f3ff] transition-colors">
              <div className="text-[28px] mb-2">📷</div>
              <div className="text-[13px] font-semibold text-[#191b24] mb-1">Drag & drop photos here</div>
              <div className="text-[11px] text-[#727787] mb-3">PNG, JPG, WEBP up to 10 MB · Minimum 5 photos</div>
              <span className="bg-[#006aff] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold">Browse files</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageAdd} />
            </label>

            {images.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-1.5 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden h-14 bg-[#e6e7f4]">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`upload-${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-700/85 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-[#727787] mt-2">
                  {images.length} photo{images.length > 1 ? 's' : ''} uploaded. First photo is the cover image.
                </div>
              </>
            )}
          </FormSection>

          <FormSection title="Amenities" active={step === 3}>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_AMENITIES.map(a => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 border-[1.5px] rounded-lg text-[12px] font-semibold transition-colors ${
                    form.amenities.includes(a.key)
                      ? 'border-[#0053cc] text-[#0053cc] bg-[#f2f3ff]'
                      : 'border-[#e6e7f4] text-[#424655]'
                  }`}
                >
                  {a.emoji} {a.key}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title="Pricing & availability" active={step === 4}>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Rent per month (₹)">
                <Input name="rent" type="number" value={form.rent} onChange={handleChange} placeholder="22000" />
              </FormGroup>
              <FormGroup label="Security deposit (₹)">
                <Input name="deposit" type="number" value={form.deposit} onChange={handleChange} placeholder="44000" />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Available from">
                <Input name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} />
              </FormGroup>
              <FormGroup label="Minimum lease (months)">
                <Select name="minLease" value={form.minLease} onChange={handleChange}>
                  {LEASE_OPTIONS.map(o => <option key={o} value={o}>{o} months</option>)}
                </Select>
              </FormGroup>
            </div>
          </FormSection>

          {/* Step navigation */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 border border-[#e6e7f4] rounded-lg py-2.5 text-[13px] font-semibold text-[#424655] hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 bg-[#006aff] text-white rounded-lg py-2.5 text-[13px] font-bold hover:bg-[#0053cc] transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* ── Right: sticky preview + actions ── */}
        <div className="sticky top-6">
          <div className="bg-white border border-[#e6e7f4] rounded-xl p-[18px]">
            <h3 className="text-[13px] font-bold text-[#191b24] mb-3">Preview</h3>

            {/* Preview card */}
            <div className="bg-[#f2f3ff] rounded-lg overflow-hidden mb-4">
              <div className="h-24 bg-gradient-to-br from-blue-200 to-blue-700" />
              <div className="p-2.5">
                <div className="text-[12px] font-bold text-[#191b24] mb-0.5">
                  {form.title || 'Property title'}
                </div>
                <div className="text-[11px] text-[#727787] mb-1.5">
                  📍 {[form.city, form.state].filter(Boolean).join(', ') || 'Location'}
                </div>
                <div className="text-[14px] font-bold text-[#0053cc]">
                  {form.rent ? formatINR(Number(form.rent)) : '₹—'}
                  <span className="text-[11px] font-normal text-[#727787]"> /mo</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={() => handleSubmit(false)}
                disabled={isPending || !allDone}
                className="w-full bg-[#006aff] text-white py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Submit for review'}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isPending}
                className="w-full bg-white border border-[#e6e7f4] text-[#424655] py-2.5 rounded-lg text-[13px] font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Save as draft
              </button>
              <button
                onClick={() => navigate('/owner/properties')}
                className="w-full text-[#727787] text-[12px] py-1.5 hover:text-gray-600 transition-colors"
              >
                Discard changes
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e6e7f4] mb-3" />

            {/* Checklist */}
            <div className="text-[11px] font-bold tracking-widest text-[#727787] uppercase mb-2.5">
              Completion checklist
            </div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(checks).map(([label, done]) => (
                <div key={label} className="flex items-center gap-2 text-[12px] text-[#424655]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${
                    done ? 'bg-[#1a6b32] text-white' : 'bg-[#e6e7f4] text-[#727787]'
                  }`}>
                    {done ? '✓' : '○'}
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {/* Warning */}
            {!allDone && (
              <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-[11px] text-amber-800 font-medium">
                ⚠ Complete all steps before submitting for admin review.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function FormSection({ title, active, children }) {
  return (
    <div className={`bg-white border rounded-xl p-5 transition-all ${
      active ? 'border-[#006aff] shadow-[0_0_0_3px_rgba(0,106,255,0.06)]' : 'border-[#e6e7f4]'
    }`}>
      <h3 className="text-[14px] font-bold text-[#191b24] mb-3.5 pb-2.5 border-b border-[#f2f3ff] tracking-tight">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FormGroup({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold tracking-widest text-[#424655] uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Input({ name, type = 'text', value, onChange, placeholder }) {
  return (
    <input
      name={name} type={type} value={value}
      onChange={onChange} placeholder={placeholder}
      className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none focus:border-[#006aff] focus:shadow-[0_0_0_3px_rgba(0,106,255,0.08)] bg-white"
    />
  )
}

function Select({ name, value, onChange, children }) {
  return (
    <select
      name={name} value={value} onChange={onChange}
      className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none focus:border-[#006aff] bg-white"
    >
      {children}
    </select>
  )
}
