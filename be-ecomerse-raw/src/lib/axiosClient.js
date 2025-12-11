import axios from 'axios'
import Cookies from 'js-cookie'

// Event emitter for account locked
const accountLockedEvent = new Event('accountLocked')

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  // Use admin-specific cookie keys to isolate from user-facing app
  const adminToken = Cookies.get('admin_token')
  const userToken = Cookies.get('token')
  const token = adminToken || userToken
  
  // Log all cookies for debugging
  const allCookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key.includes('token') || key.includes('admin')) {
      acc[key] = value ? value.substring(0, 20) + '...' : 'empty'
    }
    return acc
  }, {})
  
  console.log('Axios request interceptor:')
  console.log('  - All cookies with "token" or "admin":', allCookies)
  console.log('  - admin_token:', adminToken ? adminToken.substring(0, 20) + '...' : 'not found')
  console.log('  - token:', userToken ? userToken.substring(0, 20) + '...' : 'not found')
  console.log('  - selected token:', token ? token.substring(0, 20) + '...' : 'NONE')
  console.log('  - URL:', config.url)
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('  - Authorization header set:', config.headers.Authorization.substring(0, 30) + '...')
  } else {
    console.log('  - WARNING: No token found in cookies!')
    console.log('  - All cookies:', document.cookie)
  }
  
  try { console.log('axios req →', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || '')) } catch {}
  return config
})

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err?.config
    const status = err?.response?.status
    const errorData = err?.response?.data
    
    try { console.error('axios err ←', status, errorData) } catch {}
    
    // Handle account locked (403 with accountLocked flag)
    if (status === 403 && errorData?.accountLocked) {
      console.log('Account locked - showing modal')
      // Dispatch event to show modal instead of auto redirect
      window.dispatchEvent(accountLockedEvent)
      return Promise.reject(err)
    }
    
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
    const refreshToken = Cookies.get('admin_refreshToken') || Cookies.get('refreshToken')
      if (!refreshToken) return Promise.reject(err)
      try {
        const res = await axiosClient.post('/refresh-token', { token: refreshToken })
        const newAccessToken = res?.data?.accessToken
        if (!newAccessToken) return Promise.reject(err)
      Cookies.set('admin_token', newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosClient(originalRequest)
      } catch (e) {
        Cookies.remove('token')
        Cookies.remove('refreshToken')
        Cookies.remove('admin_token')
        Cookies.remove('admin_refreshToken')
        try { console.error('refresh-token failed', e?.response?.status, e?.response?.data) } catch {}
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  },
)

export default axiosClient


