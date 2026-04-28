const variants = {
  green:  'bg-green-100 text-green-800',
  amber:  'bg-amber-100 text-amber-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-600',
}

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${variants[variant]}`}>
      {label}
    </span>
  )
}