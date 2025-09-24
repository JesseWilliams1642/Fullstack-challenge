import axiosInstance from '../lib/axios';

export const getHelloWorld = async (): Promise<any> => {
  return axiosInstance.get('/api' /*, { withCredentials: true }*/);
};