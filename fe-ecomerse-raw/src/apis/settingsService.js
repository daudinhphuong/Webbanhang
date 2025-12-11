import axiosClient from './axiosClient'

export const getShopSettings = () => {
  return axiosClient.get('/settings')
}

export const updateShopSettings = (data) => {
  return axiosClient.put('/settings', data)
}

export const updateShopSettingsTest = (data) => {
  return axiosClient.put('/settings/test', data)
}

export const updateShopSettingsPublic = (data) => {
  return axiosClient.post('/settings/public', data)
}

export const getContactInfo = () => {
  return axiosClient.get('/settings/contact')
}

// Deprecated: Sử dụng customerMessageService.sendCustomerMessage thay thế
export const submitContactForm = (formData) => {
  // Map form data to customer message format
  const messageData = {
    customerName: formData.name,
    customerEmail: formData.email,
    customerPhone: formData.phone,
    subject: formData.subject,
    message: formData.message,
    channel: 'email',
    priority: 'medium'
  }
  return axiosClient.post('/support/customer-messages/public', messageData)
}
