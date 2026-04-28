import { createContext, useContext, useState, useEffect } from 'react'
import { getToken, saveToken, removeToken } from '../utils/tokenStorage'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      try {
        const decoded = jwtDecode(token)
        
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id:    decoded.sub || decoded.id,
            name:  decoded.name,
            email: decoded.email,
            role:  decoded.role,  
          })
        } else {
          removeToken()
        }
      } catch {
        removeToken()
      }
    }
    setLoading(false)
  }, [])

  function login(token) {
    saveToken(token)
    const decoded = jwtDecode(token)
    setUser({
      id:    decoded.sub || decoded.id,
      name:  decoded.name,
      email: decoded.email,
      role:  decoded.role,
    })
  }

  function logout() {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}