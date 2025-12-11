import axiosClient from './axiosClient'

// Get user profile
export const getUserProfile = () => {
  return axiosClient.get('/user/profile')
}

// Get user profile (test endpoint)
export const getUserProfileTest = () => {
  return axiosClient.get('/user/profile/test')
}

// Update user profile
export const updateUserProfile = (data) => {
  return axiosClient.put('/user/profile', data)
}

// Update user profile (test endpoint)
export const updateUserProfileTest = (data) => {
  return axiosClient.put('/user/profile/test', data)
}

// Change password
export const changePassword = (data) => {
  return axiosClient.put('/user/password', data)
}

// Upload avatar
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append('avatar', file)
  return axiosClient.post('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Get user orders
export const getUserOrders = (page = 1, limit = 10) => {
  return axiosClient.get(`/user/orders?page=${page}&limit=${limit}`)
}

// Get user settings
export const getUserSettings = () => {
  return axiosClient.get('/user/settings')
}

// Update user settings
export const updateUserSettings = (data) => {
  return axiosClient.put('/user/settings', data)
}
