import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && user.isAdmin === false) return <Navigate to="/login" replace />
  return <Outlet />
}

export default PrivateRoute


