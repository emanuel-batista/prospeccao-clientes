import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
});

// Callback para notificar o contexto de autenticação React sobre status 401
let onUnauthorizedCallback = null;

export const registerUnauthorizedHandler = (callback) => {
    onUnauthorizedCallback = callback;
};

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('@prospeccao:token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config?.url?.includes('/auth/login');

            if (!isLoginRequest) {
                await AsyncStorage.multiRemove(['@prospeccao:token', '@prospeccao:user']);
                if (typeof onUnauthorizedCallback === 'function') {
                    onUnauthorizedCallback();
                }
            }
        }
        return Promise.reject(error);
    }
);

// Helper para resolver URL de avatar (relativa do backend ou absoluta)
export const resolveAvatarUrl = (uri) => {
    if (!uri) return null;
    if (
        uri.startsWith('http://') ||
        uri.startsWith('https://') ||
        uri.startsWith('file://') ||
        uri.startsWith('content://')
    ) {
        return uri;
    }
    const baseURL = api.defaults.baseURL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const cleanBase = baseURL.replace(/\/+$/, '');
    const cleanUri = uri.replace(/^\/+/, '');
    return `${cleanBase}/${cleanUri}`;
};

export default api;