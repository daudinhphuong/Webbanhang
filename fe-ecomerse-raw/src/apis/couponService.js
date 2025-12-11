import axiosClient from './axiosClient';

export const validateCoupon = async (code, orderAmount, userId = null) => {
  try {
    const response = await axiosClient.post('/coupons/validate', {
      code,
      orderAmount,
      userId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCoupons = async () => {
  try {
    const response = await axiosClient.get('/coupons');
    return response.data;
  } catch (error) {
    throw error;
  }
};
