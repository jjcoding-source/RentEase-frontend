const variants = {
  primary:  'bg-[#006aff] text-white hover:bg-[#0053cc]',
  outline:  'bg-white text-[#0053cc] border border-[#b2c5ff] hover:bg-brand-50',
  ghost:    'bg-transparent text-gray-500 hover:text-gray-700',
  danger:   'bg-white text-red-700 border border-red-200 hover:bg-red-50',
}

export default function Button({
  children, onClick, variant = 'primary',
  type = 'button', disabled = false, className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg text-sm font-bold transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}