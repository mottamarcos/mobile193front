import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://backend-mobile193.fly.dev/api',
  timeout: 5000, // Substitua pela URL da sua API
});

//Configuração do Axios para incluir o token JWT em cada requisição
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token"); // Recupera o token do AsyncStorage

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
