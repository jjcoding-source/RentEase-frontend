import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function goToDashboard() {
    if (!user)                return navigate('/auth')
    if (user.role === 'Admin') return navigate('/admin')
    if (user.role === 'Owner') return navigate('/owner')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#fee2e2] rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#b91c1c" strokeWidth="1.8"/>
            <path d="M18 10v10M18 24v2" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="text-[22px] font-bold text-[#0f172a] mb-2 tracking-tight">
          Access denied
        </h1>
        <p className="text-[13px] text-[#64748b] leading-relaxed mb-2">
          You don't have permission to view this page.
        </p>
        {user && (
          <p className="text-[12px] text-[#94a3b8] mb-6">
            Logged in as <span className="font-semibold text-[#475569]">{user.name}</span> ·{' '}
            <span className="font-semibold text-[#475569]">{user.role}</span>
          </p>
        )}

        <div className="flex gap-2.5 justify-center">
          <button
            onClick={goToDashboard}
            className="bg-[#1558c0] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] transition-colors"
          >
            Go to my dashboard
          </button>
          <button
            onClick={() => { logout(); navigate('/auth') }}
            className="border border-[#e2e8f0] bg-white text-[#64748b] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors"
          >
            Switch account
          </button>
        </div>
      </div>
    </div>
  )
}