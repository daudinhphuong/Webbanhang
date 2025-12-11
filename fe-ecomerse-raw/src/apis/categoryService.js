import axiosClient from './axiosClient'

export const getCategories = async () => {
  const res = await axiosClient.get('/categories')
  return Array.isArray(res.data) ? res.data : (res.data?.data || [])
}


