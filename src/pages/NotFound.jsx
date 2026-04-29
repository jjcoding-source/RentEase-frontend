import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const navigate  = useNavigate()
  const { user }  = useAuth()

  function goHome() {
    if (!user)                return navigate('/')
    if (user.role === 'Admin') return navigate('/admin')
    if (user.role === 'Owner') return navigate('/owner')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
       
        <div className="text-[96px] font-bold text-[#e2e8f0] leading-none tracking-tight mb-2">
          404
        </div>

        {/* House illustration */}
        <div className="w-24 h-24 mx-auto mb-5">
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="96" height="96" rx="16" fill="#eef4ff"/>
            <rect x="18" y="46" width="60" height="38" rx="3" fill="#bfdbfe"/>
            <polygon points="14,46 48,18 82,46" fill="#93c5fd"/>
            <rect x="36" y="58" width="24" height="26" rx="2" fill="#1558c0"/>
            <rect x="20" y="54" width="18" height="18" rx="2" fill="#1558c0"/>
            <rect x="58" y="54" width="18" height="18" rx="2" fill="#1558c0"/>
            <circle cx="72" cy="28" r="10" fill="#fef9c3"/>
            <path d="M68 28l2.5 2.5L76 24" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-[22px] font-bold text-[#0f172a] mb-2 tracking-tight">
          Page not found
        </h1>
        <p className="text-[13px] text-[#64748b] leading-relaxed mb-6">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back home.
        </p>

        <div className="flex gap-2.5 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="border border-[#e2e8f0] bg-white text-[#64748b] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Go back
          </button>
          <button
            onClick={goHome}
            className="bg-[#1558c0] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}