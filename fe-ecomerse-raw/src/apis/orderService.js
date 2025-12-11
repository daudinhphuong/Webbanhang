import axiosClient from './axiosClient';

const createOrder = async (data) => {
  return await axiosClient.post(`/orders`, data);
};

const getDetailOrder = async (id) => {
  return await axiosClient.get(`/orders/${id}`);
};

const getMyOrders = async () => {
  return await axiosClient.get(`/orders`);
};

export { createOrder, getDetailOrder, getMyOrders };
