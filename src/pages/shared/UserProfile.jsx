import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { useAuth } from '../../context/AuthContext'
import { useMyBookings } from '../../hooks/useBookings'
import { useMe, useUpdateMe, useChangePassword, useUpdatePreferences } from '../../hooks/useUser'
import { formatINR } from '../../utils/formatCurrency'
import Badge from '../../components/ui/Badge'

const TABS = ['Personal details', 'Booking history', 'Preferences']

const STATUS_BADGE = {
  Pending:   'amber',
  Confirmed: 'green',
  Rejected:  'red',
  Completed: 'blue',
}

const CARD_GRADIENTS = [
  'from-blue-200 to-blue-700',
  'from-cyan-200 to-teal-600',
  'from-gray-200 to-gray-600',
]

const DEFAULT_PREFS = {
  bookingUpdates:     true,
  newListings:        true,
  priceDropAlerts:    false,
  marketingEmails:    false,
}

export default function UserProfile() {
  const { user, login } = useAuth()

  // ── Real API Hooks ──
  const { data: profile, isLoading: loadingProfile } = useMe()
  const { data: bookings = [], isLoading: loadingBookings } = useMyBookings()
  const { mutateAsync: updateMe, isPending: savingProfile } = useUpdateMe()
  const { mutateAsync: changePasswordFn, isPending: savingPw } = useChangePassword()
  const { mutateAsync: updatePrefsFn } = useUpdatePreferences()

  const [tab,      setTab]      = useState('Personal details')
  const [editMode, setEditMode] = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [showPw,   setShowPw]   = useState(false)

  const [form, setForm] = useState({
    name:  '',
    email: '',
    phone: '',
    dob:   '',
    city:  '',
  })

  const [prefs, setPrefs] = useState(DEFAULT_PREFS)

  const [pwForm, setPwForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  // Populate form when profile data loads
  useEffect(() => {
    if (profile) {
      setForm({
        name:  profile.name  || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dob:   profile.dateOfBirth || profile.dob || '',
        city:  profile.city  || '',
      })

      if (profile.preferences || profile.prefBookingUpdates !== undefined) {
        setPrefs({
          bookingUpdates:     profile.prefBookingUpdates  ?? profile.preferences?.bookingUpdates     ?? true,
          newListings:        profile.prefNewListings     ?? profile.preferences?.newListings        ?? true,
          priceDropAlerts:    profile.prefPriceDropAlerts ?? profile.preferences?.priceDropAlerts    ?? false,
          marketingEmails:    profile.prefMarketingEmails ?? profile.preferences?.marketingEmails    ?? false,
        })
      }
    }
  }, [profile])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSaveProfile() {
    setError('')
    setSuccess('')

    try {
      const updatedUser = await updateMe({
        name:        form.name,
        email:       form.email,
        phone:       form.phone,
        city:        form.city,
        dateOfBirth: form.dob,
      })

      if (updatedUser?.token) {
        login(updatedUser.token)
      }

      setSuccess('Profile saved successfully.')
      setEditMode(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.')
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (pwForm.next !== pwForm.confirm) {
      return setError('New passwords do not match.')
    }

    try {
      await changePasswordFn({
        currentPassword: pwForm.current,
        newPassword:     pwForm.next,
      })

      setSuccess('Password changed successfully.')
      setPwForm({ current: '', next: '', confirm: '' })
      setShowPw(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    }
  }

  async function handlePrefToggle(key) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)

    try {
      await updatePrefsFn(updated)
    } catch (err) {
      setPrefs(prefs) // revert on failure
      console.error('Failed to update preferences:', err)
    }
  }

  // Stats
  const activeBookings    = bookings.filter(b => b.status === 'Confirmed').length
  const completedBookings = bookings.filter(b => b.status === 'Completed').length

  return (
    <PageWrapper>
      {/* ── Profile header ── */}
      <div className="bg-white border border-[#e6e7f4] rounded-xl p-6 flex items-start gap-5 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#0053cc] to-[#00687a] flex items-center justify-center text-[24px] font-bold text-white">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-[#006aff] rounded-full flex items-center justify-center text-white text-[11px] border-2 border-white cursor-pointer">
            ✎
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[22px] font-bold text-[#191b24] tracking-tight mb-0.5">
            {form.name || user?.name}
          </div>
          <div className="inline-block bg-[#f2f3ff] text-[#0040a1] text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
            {user?.role}
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { icon: '📧', val: form.email || user?.email },
              { icon: '📞', val: form.phone || '+91 —' },
              { icon: '📍', val: form.city  || '—' },
            ].map(({ icon, val }) => (
              <span key={val} className="text-[12px] text-[#424655]">
                {icon} {val}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowPw(v => !v)}
            className="bg-white text-[#0053cc] border border-[#b2c5ff] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#f2f3ff] transition-colors"
          >
            Change password
          </button>

          {editMode ? (
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="bg-[#006aff] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] disabled:opacity-60 transition-colors"
            >
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-[#006aff] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] transition-colors"
            >
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* ── Change password panel ── */}
      {showPw && (
        <form
          onSubmit={handleChangePassword}
          className="bg-white border border-[#b2c5ff] rounded-xl p-5 mb-4"
        >
          <h3 className="text-[14px] font-bold text-[#191b24] mb-3">Change password</h3>
          <div className="grid grid-cols-3 gap-3">
            <PwField 
              label="Current password" 
              name="current" 
              value={pwForm.current} 
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} 
            />
            <PwField 
              label="New password" 
              name="next" 
              value={pwForm.next} 
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} 
            />
            <PwField 
              label="Confirm new" 
              name="confirm" 
              value={pwForm.confirm} 
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} 
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button 
              type="submit" 
              disabled={savingPw}
              className="bg-[#006aff] text-white px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#0053cc] disabled:opacity-60"
            >
              {savingPw ? 'Updating...' : 'Update password'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowPw(false)} 
              className="border border-[#e6e7f4] px-4 py-2 rounded-lg text-[13px] font-semibold text-[#424655] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Alerts ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-2.5 mb-3 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-[12px] rounded-xl px-4 py-2.5 mb-3 font-medium">
          {success}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 bg-white border border-[#e6e7f4] rounded-xl p-1 mb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors ${
              tab === t ? 'bg-[#0053cc] text-white' : 'text-[#727787] hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* PERSONAL DETAILS */}
      {tab === 'Personal details' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left - Personal Information */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#e6e7f4]">
                <h2 className="text-[14px] font-bold text-[#191b24]">Personal information</h2>
                <button
                  onClick={() => setEditMode(v => !v)}
                  className="text-[12px] text-[#0053cc] font-semibold hover:underline"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {[
                { label: 'Full name',     name: 'name',  type: 'text' },
                { label: 'Email address', name: 'email', type: 'email' },
                { label: 'Phone number',  name: 'phone', type: 'text' },
                { label: 'Date of birth', name: 'dob',   type: 'date' },
                { label: 'City',          name: 'city',  type: 'text' },
              ].map(({ label, name, type }) => (
                <div key={name} className="px-[18px] py-3 border-b border-[#f2f3ff] last:border-0">
                  <label className="block text-[10px] font-bold tracking-widest text-[#727787] uppercase mb-1">
                    {label}
                  </label>
                  {editMode ? (
                    <input
                      name={name}
                      type={type}
                      value={form[name]}
                      onChange={handleChange}
                      className="w-full border border-[#c2c6d8] rounded-lg px-3 py-2 text-[13px] text-[#191b24] outline-none focus:border-[#006aff] font-[inherit]"
                    />
                  ) : (
                    <div className="text-[13px] text-[#191b24] font-medium">
                      {form[name] || '—'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stats & Recent Bookings */}
          <div className="flex flex-col gap-4">
            {/* Stats */}
            <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
              <div className="px-[18px] py-3.5 border-b border-[#e6e7f4]">
                <h2 className="text-[14px] font-bold text-[#191b24]">
                  {user?.role === 'Owner' ? 'Owner stats' : 'Renter stats'}
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-[18px]">
                <MiniStat num={activeBookings} label="Active bookings" />
                <MiniStat num={completedBookings} label="Total stays" />
                <MiniStat num="4.9" label="Trust score" />
              </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#e6e7f4]">
                <h2 className="text-[14px] font-bold text-[#191b24]">Recent bookings</h2>
                <button
                  onClick={() => setTab('Booking history')}
                  className="text-[12px] text-[#0053cc] font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>

              {loadingBookings ? (
                <div className="py-6 text-center text-[12px] text-gray-400 animate-pulse">Loading...</div>
              ) : bookings.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-gray-400">No bookings yet.</div>
              ) : (
                bookings.slice(0, 3).map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3 px-[18px] py-3.5 border-b border-[#f2f3ff] last:border-0">
                    <div className={`w-12 h-9 rounded-lg bg-gradient-to-br ${CARD_GRADIENTS[i % 3]} flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-[#191b24]">{b.propertyTitle}</div>
                      <div className="text-[11px] text-[#727787] mt-0.5">
                        {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'} 
                        {b.rent ? ` · ${formatINR(b.rent)}/mo` : ''}
                      </div>
                    </div>
                    <Badge label={b.status} variant={STATUS_BADGE[b.status] || 'gray'} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKING HISTORY */}
      {tab === 'Booking history' && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e6e7f4]">
            <h2 className="text-[14px] font-bold text-[#191b24]">All bookings ({bookings.length})</h2>
          </div>

          {loadingBookings && (
            <div className="py-10 text-center text-[13px] text-gray-400 animate-pulse">Loading bookings...</div>
          )}

          {!loadingBookings && bookings.length === 0 && (
            <div className="py-14 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-[13px] text-gray-400">No bookings yet.</div>
            </div>
          )}

          {!loadingBookings && bookings.length > 0 && (
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-[#faf8ff]">
                  {['Property','Move-in','Duration','Rent','Status'].map((h, i) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-bold tracking-widest text-[#727787] uppercase border-b border-[#e6e7f4]"
                      style={{ width: ['35%','18%','15%','17%','15%'][i] }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className="border-b border-[#f2f3ff] hover:bg-[#faf8ff] last:border-0">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-8 rounded-md bg-gradient-to-br ${CARD_GRADIENTS[i % 3]} flex-shrink-0`} />
                        <div className="text-[13px] font-semibold text-[#191b24]">{b.propertyTitle}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#424655]">
                      {b.moveIn ? new Date(b.moveIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-[#424655]">
                      {b.duration ? `${b.duration} mo` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#0053cc]">
                      {b.rent ? formatINR(b.rent) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge label={b.status} variant={STATUS_BADGE[b.status] || 'gray'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PREFERENCES */}
      {tab === 'Preferences' && (
        <div className="bg-white border border-[#e6e7f4] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e6e7f4]">
            <h2 className="text-[14px] font-bold text-[#191b24]">Notification preferences</h2>
          </div>
          {[
            { key: 'bookingUpdates',  label: 'Booking updates',       sub: 'Approval, rejection, reminders' },
            { key: 'newListings',     label: 'New matching listings',  sub: 'Based on saved searches' },
            { key: 'priceDropAlerts', label: 'Price drop alerts',      sub: 'For saved properties' },
            { key: 'marketingEmails', label: 'Marketing emails',       sub: 'Tips, guides, platform news' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4 border-b border-[#f2f3ff] last:border-0">
              <div>
                <div className="text-[13px] font-medium text-[#191b24]">{label}</div>
                <div className="text-[11px] text-[#727787] mt-0.5">{sub}</div>
              </div>
              <button
                onClick={() => handlePrefToggle(key)}
                className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
                  prefs[key] ? 'bg-[#0053cc]' : 'bg-[#d8d9e5]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    prefs[key] ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

// ── Small helper components ──
function MiniStat({ num, label }) {
  return (
    <div className="text-center p-3 bg-[#f2f3ff] rounded-lg">
      <div className="text-[20px] font-bold text-[#0053cc] tracking-tight">{num}</div>
      <div className="text-[10px] text-[#727787] font-semibold mt-0.5">{label}</div>
    </div>
  )
}

function PwField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest text-[#727787] uppercase mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type="password"
        value={value}
        onChange={onChange}
        className="w-full border border-[#c2c6d8] rounded-lg px-3 py-2 text-[13px] text-[#191b24] outline-none focus:border-[#006aff] font-[inherit]"
      />
    </div>
  )
}