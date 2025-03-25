import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.20.126:3000';

const apiProvider = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthToken = async () => {
  let token = await SecureStore.getItemAsync('token');
  if (token) {
    token = token.replace(/^"|"$/g, ''); // Elimina comillas si existen
  }
  return token;
};

apiProvider.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiProvider.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Token inválido o expirado. Eliminando sesión...');
      await SecureStore.deleteItemAsync('token');
      router.replace('/(public)/login');
    }
    return Promise.reject(error);
  }
);

export default apiProvider;