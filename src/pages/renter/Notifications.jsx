import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axiosInstance'

const TYPE_DOT = {
  booking:  { color: '#16a34a', bg: '#dcfce7' },
  reminder: { color: '#b45309', bg: '#fef9c3' },
  price:    { color: '#1558c0', bg: '#dbeafe' },
  system:   { color: '#94a3b8', bg: '#f1f5f9' },
}

const FILTERS = ['All', 'Unread', 'Bookings', 'Price alerts', 'System']

export default function Notifications() {
  const [filter, setFilter] = useState('All')
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/notifications').then(r => r.data),
  })

  const { mutateAsync: markAllRead } = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutateAsync: markOneRead } = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unread = notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    if (filter === 'All')          return true
    if (filter === 'Unread')       return !n.read
    if (filter === 'Bookings')     return n.type === 'booking'
    if (filter === 'Price alerts') return n.type === 'price'
    if (filter === 'System')       return n.type === 'system'
    return true
  })

  return (
    <PageWrapper unreadNotifs={unread}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[17px] font-bold text-[#0f172a]">Notifications</h1>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="border border-[#e2e8f0] text-[#64748b] px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-gray-50 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              filter === f
                ? 'bg-[#1558c0] text-white border-[#1558c0]'
                : 'bg-white text-[#64748b] border-[#e2e8f0] hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1,2,3,4].map(i => <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl h-16 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl py-14 text-center">
          <div className="text-3xl mb-2">🔔</div>
          <div className="text-[13px] text-gray-400 font-medium">No notifications here.</div>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
          {filtered.map((n, i) => {
            const dot = TYPE_DOT[n.type] || TYPE_DOT.system
            return (
              <div
                key={n.id || i}
                onClick={() => !n.read && markOneRead(n.id)}
                className={`flex gap-3 px-5 py-4 border-b border-[#f8faff] last:border-0 cursor-pointer transition-colors ${
                  !n.read ? 'bg-[#f8faff] hover:bg-[#eef4ff]' : 'hover:bg-gray-50'
                }`}
              >
                {/* Type dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: dot.bg }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot.color }} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className={`text-[13px] leading-snug ${!n.read ? 'text-[#1e293b] font-semibold' : 'text-[#475569]'}`}>
                    {n.message}
                  </div>
                  {n.subtext && (
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">{n.subtext}</div>
                  )}
                </div>

                {/* Time + unread dot */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] text-[#94a3b8]">{n.timeAgo}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#1558c0]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}