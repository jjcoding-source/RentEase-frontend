import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

const SECTIONS = ['Account', 'Notifications', 'Privacy', 'Danger zone']

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeSection, setActiveSection] = useState('Account')
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  // Account settings state
  const [accountForm, setAccountForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    phone:    '',
    language: 'English',
    timezone: 'Asia/Kolkata',
  })

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    emailBookingUpdates:  true,
    emailNewListings:     true,
    emailPriceDrops:      false,
    emailMarketing:       false,
    pushBookingUpdates:   true,
    pushNewListings:      false,
  })

  // Privacy settings
  const [privacyPrefs, setPrivacyPrefs] = useState({
    showProfileToOwners: true,
    shareRenterScore:    true,
    allowReviews:        true,
  })

  function handleAccountChange(e) {
    setAccountForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function saveAccount() {
    setError(''); setSuccess(''); setSaving(true)
    try {
      await api.put('/users/me', accountForm)
      setSuccess('Account settings saved.')
    } catch {
      setError('Failed to save settings.')
    } finally { setSaving(false) }
  }

  async function saveNotifs() {
    setError(''); setSuccess(''); setSaving(true)
    try {
      await api.patch('/users/me/preferences', notifPrefs)
      setSuccess('Notification preferences saved.')
    } catch {
      setError('Failed to save preferences.')
    } finally { setSaving(false) }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return
    try {
      await api.delete('/users/me')
      logout()
      navigate('/')
    } catch {
      setError('Failed to delete account.')
    }
  }

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-[17px] font-bold text-[#0f172a]">Settings</h1>
        <p className="text-[12px] text-[#64748b] mt-0.5">Manage your account, notifications, and privacy</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-xl px-4 py-2.5 mb-4 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-[12px] rounded-xl px-4 py-2.5 mb-4 font-medium">
          ✓ {success}
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: '180px 1fr' }}>

        {/* ── Left nav ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-2 h-fit sticky top-4">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setActiveSection(s); setSuccess(''); setError('') }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-colors mb-0.5 ${
                activeSection === s
                  ? 'bg-[#eef4ff] text-[#1558c0]'
                  : s === 'Danger zone'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-[#64748b] hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Right content ── */}
        <div>

          {/* ══ Account ══ */}
          {activeSection === 'Account' && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <SectionHeader title="Account settings" sub="Update your basic account information" />
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <SettingField label="Full name">
                    <input name="name" value={accountForm.name} onChange={handleAccountChange} />
                  </SettingField>
                  <SettingField label="Email address">
                    <input name="email" type="email" value={accountForm.email} onChange={handleAccountChange} />
                  </SettingField>
                  <SettingField label="Phone number">
                    <input name="phone" value={accountForm.phone} onChange={handleAccountChange} placeholder="+91 98765 43210" />
                  </SettingField>
                  <SettingField label="Language">
                    <select name="language" value={accountForm.language} onChange={handleAccountChange}>
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Kannada</option>
                      <option>Tamil</option>
                    </select>
                  </SettingField>
                  <SettingField label="Timezone">
                    <select name="timezone" value={accountForm.timezone} onChange={handleAccountChange}>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </SettingField>
                </div>

                {/* Current role badge */}
                <div className="flex items-center gap-3 bg-[#f8faff] border border-[#e2e8f0] rounded-lg px-4 py-3">
                  <div>
                    <div className="text-[12px] font-semibold text-[#334155]">Account type</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      Your role determines what you can do on RentEase
                    </div>
                  </div>
                  <span className="ml-auto bg-[#dbeafe] text-[#1558c0] text-[11px] font-bold px-3 py-1 rounded-full">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={saveAccount} disabled={saving}
                  className="self-start bg-[#1558c0] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* ══ Notifications ══ */}
          {activeSection === 'Notifications' && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <SectionHeader title="Notification preferences" sub="Choose how and when we contact you" />

              <div className="p-5">
                <div className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">
                  Email notifications
                </div>
                <div className="flex flex-col gap-0 mb-5">
                  {[
                    { key: 'emailBookingUpdates', label: 'Booking updates',     sub: 'Confirmations, rejections, reminders' },
                    { key: 'emailNewListings',     label: 'New matching listings', sub: 'Based on your saved searches' },
                    { key: 'emailPriceDrops',      label: 'Price drop alerts',  sub: 'When saved properties drop in price' },
                    { key: 'emailMarketing',        label: 'Marketing & tips',   sub: 'Platform news, guides, promotions' },
                  ].map(({ key, label, sub }) => (
                    <ToggleRow
                      key={key} label={label} sub={sub}
                      checked={notifPrefs[key]}
                      onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                    />
                  ))}
                </div>

                <div className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3">
                  Push notifications
                </div>
                <div className="flex flex-col gap-0 mb-5">
                  {[
                    { key: 'pushBookingUpdates', label: 'Booking updates', sub: 'Real-time alerts for booking changes' },
                    { key: 'pushNewListings',     label: 'New listings',    sub: 'When new matching properties are posted' },
                  ].map(({ key, label, sub }) => (
                    <ToggleRow
                      key={key} label={label} sub={sub}
                      checked={notifPrefs[key]}
                      onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                    />
                  ))}
                </div>

                <button
                  onClick={saveNotifs} disabled={saving}
                  className="bg-[#1558c0] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ══ Privacy ══ */}
          {activeSection === 'Privacy' && (
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <SectionHeader title="Privacy settings" sub="Control your visibility and data sharing" />
              <div className="p-5">
                <div className="flex flex-col gap-0 mb-5">
                  {[
                    { key: 'showProfileToOwners', label: 'Show profile to owners', sub: 'Owners can see your name and renter score when you book' },
                    { key: 'shareRenterScore',     label: 'Share renter score',    sub: 'Display your trust score on booking requests' },
                    { key: 'allowReviews',         label: 'Allow reviews',         sub: 'Owners can leave reviews after your stay' },
                  ].map(({ key, label, sub }) => (
                    <ToggleRow
                      key={key} label={label} sub={sub}
                      checked={privacyPrefs[key]}
                      onChange={() => setPrivacyPrefs(p => ({ ...p, [key]: !p[key] }))}
                    />
                  ))}
                </div>

                <div className="bg-[#f8faff] border border-[#e2e8f0] rounded-xl p-4">
                  <div className="text-[13px] font-semibold text-[#334155] mb-1">Your data</div>
                  <div className="text-[12px] text-[#64748b] leading-relaxed mb-3">
                    You can request a copy of all your data stored on RentEase, or ask us to delete your data.
                  </div>
                  <div className="flex gap-2">
                    <button className="border border-[#e2e8f0] bg-white text-[#64748b] px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors">
                      Download my data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ Danger zone ══ */}
          {activeSection === 'Danger zone' && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-red-100 bg-red-50">
                <div className="text-[14px] font-bold text-red-700">Danger zone</div>
                <div className="text-[12px] text-red-500 mt-0.5">These actions are irreversible. Please proceed with caution.</div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Logout all devices */}
                <div className="flex items-start justify-between gap-4 py-3 border-b border-[#f8faff]">
                  <div>
                    <div className="text-[13px] font-semibold text-[#334155]">Log out all devices</div>
                    <div className="text-[12px] text-[#94a3b8] mt-0.5">
                      This will end all active sessions on all your devices.
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/auth') }}
                    className="flex-shrink-0 border border-[#e2e8f0] bg-white text-[#64748b] px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Log out all
                  </button>
                </div>

                {/* Deactivate account */}
                <div className="flex items-start justify-between gap-4 py-3 border-b border-[#f8faff]">
                  <div>
                    <div className="text-[13px] font-semibold text-[#334155]">Deactivate account</div>
                    <div className="text-[12px] text-[#94a3b8] mt-0.5">
                      Your account will be hidden. You can reactivate later by logging in.
                    </div>
                  </div>
                  <button className="flex-shrink-0 border border-amber-300 text-amber-700 bg-amber-50 px-4 py-2 rounded-lg text-[12px] font-semibold hover:bg-amber-100 transition-colors">
                    Deactivate
                  </button>
                </div>

                {/* Delete account */}
                <div className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <div className="text-[13px] font-semibold text-red-700">Delete account permanently</div>
                    <div className="text-[12px] text-[#94a3b8] mt-0.5">
                      All your data, bookings, and listings will be permanently removed. This cannot be undone.
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-red-700 transition-colors"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Small helpers ──
function SectionHeader({ title, sub }) {
  return (
    <div className="px-5 py-4 border-b border-[#e2e8f0]">
      <div className="text-[14px] font-bold text-[#0f172a]">{title}</div>
      <div className="text-[12px] text-[#64748b] mt-0.5">{sub}</div>
    </div>
  )
}

function SettingField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">{label}</label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-[#e2e8f0] [&_input]:rounded-lg [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-[13px] [&_input]:text-[#1e293b] [&_input]:outline-none [&_input:focus]:border-[#1558c0] [&_input]:font-[inherit] [&_select]:w-full [&_select]:border [&_select]:border-[#e2e8f0] [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-[13px] [&_select]:text-[#1e293b] [&_select]:outline-none [&_select]:font-[inherit]">
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#f8faff] last:border-0">
      <div>
        <div className="text-[13px] font-medium text-[#334155]">{label}</div>
        <div className="text-[11px] text-[#94a3b8] mt-0.5">{sub}</div>
      </div>
      <button
        onClick={onChange}
        className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ml-4 ${checked ? 'bg-[#1558c0]' : 'bg-[#d8d9e5]'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
