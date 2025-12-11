import axiosClient from './axiosClient'

export const fetchNews = async (page = 1, limit = 10) => {
  const res = await axiosClient.get(`/about-posts?page=${page}&limit=${limit}`)
  // backend may return array directly or in data
  const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.contents || [])
  const total = res.data?.total || data.length
  return { items: data, total }
}

export const fetchNewsDetail = async (id) => {
  const res = await axiosClient.get(`/about-posts/${id}`)
  return res.data?.data || res.data
}


