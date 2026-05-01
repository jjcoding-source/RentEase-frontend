import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useProperty, useCreateProperty, useUpdateProperty } from '../../hooks/useProperties'
import { useToast } from '../../components/ui/Toast'
import { uploadImages } from '../../api/uploadApi'
import { formatINR } from '../../utils/formatCurrency'

const STEPS = ['Basic info', 'Location', 'Photos', 'Amenities', 'Pricing & availability']
const PROPERTY_TYPES   = ['Apartment', 'House', 'Studio', 'Villa', 'PG']
const LISTING_STATUSES = ['Active', 'Draft', 'Inactive']
const LEASE_OPTIONS    = [3, 6, 11, 12, 24]
const ALL_AMENITIES    = [
  { key: 'WiFi',          emoji: '📶' },
  { key: 'Parking',       emoji: '🅿'  },
  { key: 'AC',            emoji: '❄'  },
  { key: 'Pool',          emoji: '🏊' },
  { key: 'Gym',           emoji: '🏋' },
  { key: 'Pet friendly',  emoji: '🐾' },
  { key: 'Security',      emoji: '🔒' },
  { key: 'Garden',        emoji: '🌿' },
  { key: 'Power backup',  emoji: '🔌' },
]

const EMPTY_FORM = {
  title: '', type: 'Apartment', status: 'Draft', description: '',
  bedrooms: '', bathrooms: '', area: '', address: '', city: '',
  state: '', pincode: '', country: 'India', amenities: [],
  rent: '', deposit: '', availableFrom: '', minLease: 12,
}

export default function AddEditProperty() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit   = Boolean(id)

  const { data: existing } = useProperty(id)
  const { mutateAsync: createProperty, isPending: isCreating } = useCreateProperty()
  const { mutateAsync: updateProperty, isPending: isUpdating } = useUpdateProperty(id)

  const [step,          setStep]          = useState(0)
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [images,        setImages]        = useState([])     // File objects (new)
  const [uploadedUrls,  setUploadedUrls]  = useState([])    // Already uploaded URLs
  const [uploading,     setUploading]     = useState(false)
  const [uploadProgress,setUploadProgress]= useState(0)
  const [error,         setError]         = useState('')

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
      setUploadedUrls(existing.images || [])
    }
  }, [existing, isEdit])

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  function toggleAmenity(key) {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(key)
        ? p.amenities.filter(a => a !== key)
        : [...p.amenities, key],
    }))
  }

  function handleImageAdd(e) {
    const files = Array.from(e.target.files)
    const valid = files.filter(f => f.size <= 10 * 1024 * 1024)
    if (valid.length < files.length) {
      toast({ message: 'Some files exceeded 10 MB and were skipped.', type: 'warning' })
    }
    setImages(prev => [...prev, ...valid].slice(0, 10 - uploadedUrls.length))
  }

  function removeNewImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function removeUploadedUrl(index) {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Checklist
  const checks = {
    'Basic information':  Boolean(form.title && form.type && form.description),
    'Address & location': Boolean(form.address && form.city && form.state),
    'Photos':             uploadedUrls.length + images.length >= 1,
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
      // Upload new images first
      let finalUrls = [...uploadedUrls]
      if (images.length > 0) {
        setUploading(true)
        setUploadProgress(20)
        const newUrls = await uploadImages(images)
        setUploadProgress(100)
        finalUrls = [...finalUrls, ...newUrls]
        setUploading(false)
      }

      // 2. Build payload
      const payload = {
        ...form,
        status:    asDraft ? 'Draft' : (isEdit ? form.status : 'Pending'),
        rent:      Number(form.rent),
        deposit:   Number(form.deposit),
        bedrooms:  Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        area:      Number(form.area),
        images:    finalUrls,
      }

      // Create or update
      if (isEdit) {
        await updateProperty(payload)
        toast({ message: 'Property updated successfully.', type: 'success' })
      } else {
        await createProperty(payload)
        toast({ message: 'Property submitted for admin review.', type: 'success' })
      }

      navigate('/owner/properties')
    } catch (err) {
      setUploading(false)
      const msg = err.response?.data?.message || 'Failed to save property.'
      setError(msg)
      toast({ message: msg, type: 'error' })
    }
  }

  const isPending = isCreating || isUpdating || uploading
  const totalImages = uploadedUrls.length + images.length

  return (
    <PageWrapper>
      {/* Top bar */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[21px] font-bold text-[#191b24] tracking-tight">
            {isEdit ? 'Edit property' : 'Add new property'}
          </h1>
          <p className="text-[12px] text-[#727787] mt-0.5">
            Fill in the details to list your property on Estates
          </p>
        </div>
        <button
          onClick={() => navigate('/owner/properties')}
          className="bg-white border border-[#e6e7f4] rounded-lg px-4 py-2 text-[12px] font-semibold text-[#424655] hover:bg-gray-50 transition-colors"
        >
          ← Back to listings
        </button>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 bg-white border border-[#e6e7f4] rounded-xl p-1 mb-5">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`flex-1 text-center py-2 rounded-lg text-[12px] font-semibold transition-colors ${
              i === step ? 'bg-[#0053cc] text-white' :
              i < step   ? 'text-green-700 bg-green-50' :
              'text-[#727787] hover:bg-gray-50'
            }`}
          >
            {i < step ? `✓ ${s}` : s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-2.5 mb-4 font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>

        {/* Left: form */}
        <div className="flex flex-col gap-4">

          {/* Basic info */}
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
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe the property..."
                className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none resize-none focus:border-[#006aff]"
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

          {/* Location */}
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
                <Input name="country" value={form.country} onChange={handleChange} />
              </FormGroup>
            </div>
            {/* Map placeholder */}
            <MapPlaceholder city={form.city} address={form.address} />
          </FormSection>

          {/* Photos */}
          <FormSection title="Property photos" active={step === 2}>
            <label className="block border-2 border-dashed border-[#c2c6d8] rounded-xl p-7 text-center cursor-pointer hover:border-[#006aff] hover:bg-[#f2f3ff] transition-colors">
              <div className="text-[28px] mb-2">📷</div>
              <div className="text-[13px] font-semibold text-[#191b24] mb-1">Drag & drop photos here</div>
              <div className="text-[11px] text-[#727787] mb-3">PNG, JPG, WEBP up to 10 MB · Minimum 1 photo</div>
              <span className="bg-[#006aff] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold">Browse files</span>
              <input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden" onChange={handleImageAdd} />
            </label>

            {/* Upload progress */}
            {uploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#424655] font-medium">Uploading images...</span>
                  <span className="text-[12px] text-[#0053cc] font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-[#e6e7f4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0053cc] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Already uploaded images */}
            {uploadedUrls.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#727787] uppercase tracking-widest mb-2">
                  Uploaded
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {uploadedUrls.map((url, i) => (
                    <div key={url} className="relative rounded-lg overflow-hidden h-14 bg-[#e6e7f4] group">
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-[#0053cc]/80 text-white text-[8px] font-bold text-center py-0.5">
                          Cover
                        </span>
                      )}
                      <button onClick={() => removeUploadedUrl(i)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-700/90 rounded-full flex items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images to upload */}
            {images.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-bold text-[#727787] uppercase tracking-widest mb-2">
                  Ready to upload
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {images.map((img, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden h-14 bg-[#e6e7f4] group">
                      <img src={URL.createObjectURL(img)} alt={`new-${i}`} className="w-full h-full object-cover" />
                      <button onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-700/90 rounded-full flex items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalImages > 0 && (
              <div className="text-[11px] text-[#727787] mt-2">
                {totalImages} photo{totalImages > 1 ? 's' : ''} total.
                {images.length > 0 ? ` ${images.length} will be uploaded on save.` : ''}
                {' '}First photo is the cover image.
              </div>
            )}
          </FormSection>

          {/* Amenities */}
          <FormSection title="Amenities" active={step === 3}>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_AMENITIES.map(a => (
                <button key={a.key} type="button" onClick={() => toggleAmenity(a.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 border-[1.5px] rounded-lg text-[12px] font-semibold transition-colors ${
                    form.amenities.includes(a.key)
                      ? 'border-[#0053cc] text-[#0053cc] bg-[#f2f3ff]'
                      : 'border-[#e6e7f4] text-[#424655] hover:bg-gray-50'
                  }`}
                >
                  {a.emoji} {a.key}
                </button>
              ))}
            </div>
          </FormSection>

          {/* Pricing */}
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
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 border border-[#e6e7f4] rounded-lg py-2.5 text-[13px] font-semibold text-[#424655] hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 bg-[#006aff] text-white rounded-lg py-2.5 text-[13px] font-bold hover:bg-[#0053cc] transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isPending || !allDone}
                className="flex-1 bg-[#006aff] text-white rounded-lg py-2.5 text-[13px] font-bold hover:bg-[#0053cc] disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Saving...' : isEdit ? 'Save changes' : 'Submit for review'}
              </button>
            )}
          </div>
        </div>

        {/* Right: sticky preview + actions */}
        <div className="sticky top-6">
          <div className="bg-white border border-[#e6e7f4] rounded-xl p-[18px]">
            <h3 className="text-[13px] font-bold text-[#191b24] mb-3">Preview</h3>

            {/* Preview card */}
            <div className="bg-[#f2f3ff] rounded-lg overflow-hidden mb-4">
              {uploadedUrls[0] || images[0] ? (
                <img
                  src={uploadedUrls[0] || URL.createObjectURL(images[0])}
                  alt="cover"
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="h-24 bg-gradient-to-br from-blue-200 to-blue-700" />
              )}
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

            {/* Actions */}
            <div className="flex flex-col gap-2 mb-4">
              <button onClick={() => handleSubmit(false)} disabled={isPending || !allDone}
                className="w-full bg-[#006aff] text-white py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] disabled:opacity-50 transition-colors"
              >
                {isPending
                  ? uploading ? `Uploading... ${uploadProgress}%` : 'Saving...'
                  : isEdit ? 'Save changes' : 'Submit for review'}
              </button>
              <button onClick={() => handleSubmit(true)} disabled={isPending}
                className="w-full bg-white border border-[#e6e7f4] text-[#424655] py-2.5 rounded-lg text-[13px] font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Save as draft
              </button>
              <button onClick={() => navigate('/owner/properties')}
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

// ── Map placeholder with Leaflet CDN ──
function MapPlaceholder({ city, address }) {
  return (
    <div className="mt-2 bg-[#dbeafe] border border-[#bfdbfe] rounded-xl h-28 flex items-center justify-center text-[13px] text-[#64748b] font-medium cursor-pointer hover:bg-[#bfdbfe] transition-colors">
      🗺 {address || city ? `${address || ''} ${city || ''}`.trim() : 'Click to pin location on map'}
    </div>
  )
}

// ── Small reusables ──
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
    <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none focus:border-[#006aff] bg-white"
    />
  )
}

function Select({ name, value, onChange, children }) {
  return (
    <select name={name} value={value} onChange={onChange}
      className="w-full border-[1.5px] border-[#c2c6d8] rounded-lg px-3 py-2.5 text-[13px] text-[#191b24] font-[inherit] outline-none focus:border-[#006aff] bg-white"
    >
      {children}
    </select>
  )
}
