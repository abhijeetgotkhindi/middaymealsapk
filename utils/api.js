// src/utils/api.js
import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Platform } from 'react-native';

// 1. Axios base config
const apiClient = axios.create({
  baseURL: 'https://middaymealsuat.wetrunk.in/api', // ✅ Replace with your API base URL
  // baseURL: 'http://192.168.1.100:3000/api', // ✅ Replace with your API base URL
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: Platform.OS !== 'ios'  // disable on iOS if it causes problems,
});

// 2. Hook for using the Axios client
const useApi = () => {
  const { setLoading, user, token } = useContext(AuthContext);

  // Automatically adds token (if logged in)
  const request = async ({ method, url, body = {}, headers = {} }) => {
    try {
      setLoading(true);
      const authHeaders = {
        ...headers,
        ...(token ? { Authorization: `Bearer: ${token}` } : {}),
      };
      const response = await apiClient({
        method,
        url,
        data: body,
        headers: authHeaders,
      });

      return response.data;
    } catch (error) {
      //console.error(error);
      throw error?.response?.data || { message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  return { request };
};

export default useApi;
