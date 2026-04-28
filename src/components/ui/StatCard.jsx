export default function StatCard({ label, value, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-[#e6e7f4] rounded-xl p-4">
      <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
        {label}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
    </div>
  )
}