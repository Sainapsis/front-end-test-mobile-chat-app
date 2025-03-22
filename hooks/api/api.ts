import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userSession');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;