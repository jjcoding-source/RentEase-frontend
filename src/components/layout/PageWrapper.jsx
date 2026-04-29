import Sidebar from './Sidebar'

export default function PageWrapper({
  children,
  pendingBookings = 0,
  savedCount      = 0,
  unreadNotifs    = 0,
}) {
  return (
    <div className="flex min-h-screen bg-[#f8faff]">
      <Sidebar
        pendingBookings={pendingBookings}
        savedCount={savedCount}
        unreadNotifs={unreadNotifs}
      />
      <main className="flex-1 p-5 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}