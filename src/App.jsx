import { Routes, Route, Navigate } from 'react-router-dom'

// Public
import Landing            from './pages/Landing'
import AuthPage           from './pages/auth/AuthPage'
import NotFound           from './pages/NotFound'
import Unauthorized       from './pages/Unauthorized'

// Guards
import ProtectedRoute     from './components/guards/ProtectedRoute'

// Renter
import RenterDashboard    from './pages/renter/RenterDashboard'
import RenterBrowse       from './pages/renter/RenterBrowse'
import PropertyDetail     from './pages/renter/PropertyDetail'
import BookingRequest     from './pages/renter/BookingRequest'
import MyBookings         from './pages/renter/MyBookings'
import RentalHistory      from './pages/renter/RentalHistory'
import SavedProperties    from './pages/renter/SavedProperties'
import Notifications      from './pages/renter/Notifications'

// Owner
import OwnerDashboard     from './pages/owner/OwnerDashboard'
import MyProperties       from './pages/owner/MyProperties'
import BookingRequests    from './pages/owner/BookingRequests'
import AddEditProperty    from './pages/owner/AddEditProperty'
import OwnerRentalHistory from './pages/owner/OwnerRentalHistory'

// Admin
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminBookings      from './pages/admin/AdminBookings'

// Shared
import UserProfile        from './pages/shared/UserProfile'
import SettingsPage       from './pages/shared/SettingsPage'

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"          element={<Landing />} />
      <Route path="/auth"      element={<AuthPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ── Renter routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['Renter']} />}>
        <Route path="/dashboard"      element={<RenterDashboard />} />
        <Route path="/my-bookings"    element={<MyBookings />} />
        <Route path="/rental-history" element={<RentalHistory />} />
        <Route path="/saved"          element={<SavedProperties />} />
        <Route path="/notifications"  element={<Notifications />} />
      </Route>

      {/* ── Shared: Renter + Owner + Admin ── */}
      <Route element={<ProtectedRoute allowedRoles={['Renter', 'Owner', 'Admin']} />}>
        <Route path="/properties"          element={<RenterBrowse />} />
        <Route path="/properties/:id"      element={<PropertyDetail />} />
        <Route path="/properties/:id/book" element={<BookingRequest />} />
        <Route path="/profile"             element={<UserProfile />} />
        <Route path="/settings"            element={<SettingsPage />} />
      </Route>

      {/* ── Owner routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin']} />}>
        <Route path="/owner"                     element={<OwnerDashboard />} />
        <Route path="/owner/properties"          element={<MyProperties />} />
        <Route path="/owner/properties/add"      element={<AddEditProperty />} />
        <Route path="/owner/properties/:id/edit" element={<AddEditProperty />} />
        <Route path="/owner/bookings"            element={<BookingRequests />} />
        <Route path="/owner/rental-history"      element={<OwnerRentalHistory />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}