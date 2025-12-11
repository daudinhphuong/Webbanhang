import axiosClient from './axiosClient'

export const getBrands = async () => {
  const res = await axiosClient.get('/brands')
  return Array.isArray(res.data) ? res.data : (res.data?.data || [])
}


