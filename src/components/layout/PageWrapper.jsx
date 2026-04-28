import Sidebar from './Sidebar'

export default function PageWrapper({ children, pendingBookings }) {
  return (
    <div className="grid min-h-screen bg-[#f2f3ff]" style={{ gridTemplateColumns: '220px 1fr' }}>
      <Sidebar pendingBookings={pendingBookings} />
      <main className="p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}