import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser, signupUser } from '../../api/authApi'

const roles = [
  {
    key: 'Renter',
    label: 'Renter',
    sub: 'Find homes',
    color: '#dbeafe',
    iconColor: '#1558c0',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="5" r="3" stroke="#1558c0" strokeWidth="1.2"/>
        <path d="M1 13c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#1558c0" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'Owner',
    label: 'Owner',
    sub: 'List property',
    color: '#dcfce7',
    iconColor: '#16a34a',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="6" width="10" height="7" rx="1" stroke="#16a34a" strokeWidth="1.2"/>
        <path d="M5 6V4.5a2 2 0 014 0V6" stroke="#16a34a" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    key: 'Admin',
    label: 'Admin',
    sub: 'Manage all',
    color: '#fce7f3',
    iconColor: '#be185d',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" rx="2" stroke="#be185d" strokeWidth="1.2"/>
        <path d="M4 7h6M4 4.5h6M4 9.5h4" stroke="#be185d" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const TEST_USERS = [
  { email: 'admin@test.com',  password: 'admin123',  name: 'Test Admin',  role: 'Admin' },
  { email: 'owner@test.com',  password: 'owner123',  name: 'Test Owner',  role: 'Owner' },
  { email: 'renter@test.com', password: 'renter123', name: 'Test Renter', role: 'Renter' },
]

function createTestToken(user) {
  const header = { alg: 'none', typ: 'JWT' }
  const payload = {
    sub: user.email,
    id: user.email,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }

  const encode = (value) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  return `${encode(header)}.${encode(payload)}.`
}

export default function AuthPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('login')      
  const [role, setRole] = useState('Renter')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })

  function handleLoginChange(e) {
    setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSignupChange(e) {
    setSignupForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const testUser = TEST_USERS.find(
        user =>
          user.email === loginForm.email.trim().toLowerCase() &&
          user.password === loginForm.password
      )

      if (testUser) {
        login(createTestToken(testUser))
        redirectByRole(testUser.role)
        return
      }

      const res = await loginUser(loginForm)
      login(res.data.token)
      redirectByRole(res.data.role)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await signupUser({ ...signupForm, role })
      login(res.data.token)
      redirectByRole(role)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function redirectByRole(userRole) {
    if (userRole === 'Admin')  return navigate('/admin')
    if (userRole === 'Owner')  return navigate('/owner/properties')
    return navigate('/properties')
  }

  return (
    <div className="min-h-screen bg-[#f2f3ff] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden grid grid-cols-2 shadow-sm">

        {/* ── Left panel ── */}
        <div className="bg-[#eef4ff] p-12 flex flex-col justify-between">
          <div className="text-[20px] font-bold text-[#1558c0]">Estates<span className="text-[#1e293b]">.</span></div>

          <div>
            <h2 className="text-[26px] font-bold text-[#0f172a] leading-tight tracking-tight mb-3">
              Your next <span className="text-[#1558c0]">home</span><br />is one click away
            </h2>
            <p className="text-[13px] text-[#475569] leading-relaxed mb-7">
              Join thousands of renters and property owners on India's most trusted rental platform.
            </p>
            <div className="flex flex-col gap-3">
              {[
                '4,200+ verified listings',
                'Zero brokerage fees',
                'Instant booking confirmation',
                'Secure JWT authentication',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <div className="w-[22px] h-[22px] bg-[#dbeafe] rounded-md flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path d="M2 6l3 3 5-5" stroke="#1558c0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[13px] text-[#334155] font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#94a3b8]">© 2025 Estates. Trusted by 18,000+ users.</div>
        </div>

        {/* ── Right panel ── */}
        <div className="p-10 flex flex-col justify-center">

          {/* Tab switcher */}
          <div className="flex border border-[#e2e8f0] rounded-lg overflow-hidden mb-7 bg-[#f8faff]">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2.5 text-[13px] font-semibold transition-colors capitalize ${
                  tab === t ? 'bg-[#1558c0] text-white' : 'text-[#64748b]'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-lg px-3 py-2 mb-4 font-medium">
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-0">
              <div className="text-[18px] font-bold text-[#0f172a] mb-1">Welcome back</div>
              <div className="text-[13px] text-[#64748b] mb-6">Log in to your Estates account</div>

              <Field label="Email address">
                <input
                  name="email" type="email" required
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                />
              </Field>
              <Field label="Password">
                <input
                  name="password" type="password" required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                />
                <span className="text-[12px] text-[#1558c0] cursor-pointer text-right mt-1 block">
                  Forgot password?
                </span>
              </Field>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#1558c0] text-white py-3 rounded-lg text-[14px] font-semibold mt-2 hover:bg-[#1248a8] transition-colors disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>

              <div className="text-[12px] text-[#94a3b8] text-center mt-4">
                Don't have an account?{' '}
                <span className="text-[#1558c0] font-semibold cursor-pointer" onClick={() => setTab('signup')}>
                  Sign up free
                </span>
              </div>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-0">
              <div className="text-[18px] font-bold text-[#0f172a] mb-1">Create account</div>
              <div className="text-[13px] text-[#64748b] mb-5">Join Estates for free today</div>

              <Field label="Full name">
                <input
                  name="name" required placeholder="Arjun Sharma"
                  value={signupForm.name} onChange={handleSignupChange}
                />
              </Field>
              <Field label="Email address">
                <input
                  name="email" type="email" required placeholder="you@example.com"
                  value={signupForm.email} onChange={handleSignupChange}
                />
              </Field>
              <Field label="Password">
                <input
                  name="password" type="password" required placeholder="••••••••"
                  value={signupForm.password} onChange={handleSignupChange}
                />
              </Field>
              <Field label="Confirm password">
                <input
                  name="confirmPassword" type="password" required placeholder="••••••••"
                  value={signupForm.confirmPassword} onChange={handleSignupChange}
                />
              </Field>

              {/* Role selector */}
              <div className="bg-[#f8faff] border border-[#e2e8f0] rounded-xl p-4 mb-4">
                <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-3">
                  Sign up as
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.key} type="button"
                      onClick={() => setRole(r.key)}
                      className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                        role === r.key
                          ? 'border-[#1558c0] bg-[#eef4ff]'
                          : 'border-[#e2e8f0] bg-[#f8faff]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                        style={{ background: r.color }}
                      >
                        {r.icon}
                      </div>
                      <div className="text-[11px] font-bold text-[#334155]">{r.label}</div>
                      <div className="text-[10px] text-[#94a3b8] mt-0.5">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-[#1558c0] text-white py-3 rounded-lg text-[14px] font-semibold hover:bg-[#1248a8] transition-colors disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="text-[12px] text-[#94a3b8] text-center mt-4">
                Already have an account?{' '}
                <span className="text-[#1558c0] font-semibold cursor-pointer" onClick={() => setTab('login')}>
                  Log in
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] font-bold tracking-widest text-[#64748b] uppercase mb-1.5">
        {label}
      </label>
      <div className="[&_input]:w-full [&_input]:border [&_input]:border-[#e2e8f0] [&_input]:rounded-lg [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-[14px] [&_input]:text-[#1e293b] [&_input]:outline-none [&_input:focus]:border-[#1558c0] [&_input]:bg-white [&_input]:font-[inherit]">
        {children}
      </div>
    </div>
  )
}
