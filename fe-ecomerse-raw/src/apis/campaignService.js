import axiosClient from './axiosClient'

export const validateCampaign = async (code, userId, orderAmount, items = []) => {
  try {
    const res = await axiosClient.post('/campaigns/validate', { code, userId, orderAmount, items })
    return res.data
  } catch (error) {
    throw error
  }
}


