import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Landing            from './pages/Landing'
import AuthPage           from './pages/auth/AuthPage'
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

// Admin
import AdminDashboard     from './pages/admin/AdminDashboard'

// Shared
import UserProfile        from './pages/shared/UserProfile'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"     element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Renter routes */}
      <Route element={<ProtectedRoute allowedRoles={['Renter', 'Owner', 'Admin']} />}>
        <Route path="/dashboard"              element={<RenterDashboard />} />
        <Route path="/properties"             element={<RenterBrowse />} />
        <Route path="/properties/:id"         element={<PropertyDetail />} />
        <Route path="/properties/:id/book"    element={<BookingRequest />} />
        <Route path="/my-bookings"            element={<MyBookings />} />
        <Route path="/rental-history"         element={<RentalHistory />} />
        <Route path="/saved"                  element={<SavedProperties />} />
        <Route path="/notifications"          element={<Notifications />} />
        <Route path="/profile"                element={<UserProfile />} />
      </Route>

      {/* Owner routes */}
      <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin']} />}>
        <Route path="/owner"                       element={<OwnerDashboard />} />
        <Route path="/owner/properties"            element={<MyProperties />} />
        <Route path="/owner/properties/add"        element={<AddEditProperty />} />
        <Route path="/owner/properties/:id/edit"   element={<AddEditProperty />} />
        <Route path="/owner/bookings"              element={<BookingRequests />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}