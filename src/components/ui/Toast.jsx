import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2"/>
      <path d="M5 8l2 2 4-4" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#fee2e2" stroke="#b91c1c" strokeWidth="1.2"/>
      <path d="M6 6l4 4M10 6l-4 4" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13h13L8 2z" fill="#fef9c3" stroke="#b45309" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M8 6v3M8 11v.5" stroke="#b45309" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#dbeafe" stroke="#1558c0" strokeWidth="1.2"/>
      <path d="M8 7v4M8 5v.5" stroke="#1558c0" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
}

const STYLES = {
  success: 'bg-white border-[#16a34a] text-[#14532d]',
  error:   'bg-white border-[#b91c1c] text-[#7f1d1d]',
  warning: 'bg-white border-[#b45309] text-[#78350f]',
  info:    'bg-white border-[#1558c0] text-[#1e3a5f]',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  function dismiss(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
              text-[13px] font-medium min-w-[280px] max-w-[360px]
              pointer-events-auto animate-slide-up
              ${STYLES[t.type]}
            `}
          >
            <span className="flex-shrink-0">{ICONS[t.type]}</span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity ml-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}