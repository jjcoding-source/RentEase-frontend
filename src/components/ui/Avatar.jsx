export default function Avatar({ initials, size = 'md', color = '#0053cc' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-16 h-16 text-2xl' }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  )
}