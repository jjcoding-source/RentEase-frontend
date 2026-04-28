import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Landing          from './pages/Landing'
import AuthPage         from './pages/auth/AuthPage'
import ProtectedRoute   from './components/guards/ProtectedRoute'

// Renter
import RenterDashboard  from './pages/renter/RenterDashboard'
import PropertyDetail   from './pages/renter/PropertyDetail'
import BookingRequest   from './pages/renter/BookingRequest'

// Owner
import MyProperties     from './pages/owner/MyProperties'
import BookingRequests  from './pages/owner/BookingRequests'
import AddEditProperty  from './pages/owner/AddEditProperty'
import OwnerDashboard  from  './pages/owner/OwnerDashboard'

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'

// Shared
import UserProfile      from './pages/shared/UserProfile'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<Landing />} />
      <Route path="/auth"     element={<AuthPage />} />

      {/* Renter routes */}
      <Route element={<ProtectedRoute allowedRoles={['Renter', 'Owner', 'Admin']} />}>
        <Route path="/properties"              element={<RenterDashboard />} />
        <Route path="/properties/:id"          element={<PropertyDetail />} />
        <Route path="/properties/:id/book"     element={<BookingRequest />} />
        <Route path="/profile"                 element={<UserProfile />} />
      </Route>

      {/* Owner routes */}
      <Route element={<ProtectedRoute allowedRoles={['Owner', 'Admin']} />}>
        <Route path="/owner/properties"        element={<MyProperties />} />
        <Route path="/owner/properties/add"    element={<AddEditProperty />} />
        <Route path="/owner/properties/:id/edit" element={<AddEditProperty />} />
        <Route path="/owner/bookings"          element={<BookingRequests />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin"                   element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}