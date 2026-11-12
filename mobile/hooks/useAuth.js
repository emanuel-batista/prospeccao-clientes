import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { registerUnauthorizedHandler } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(async () => {
        await AsyncStorage.multiRemove(['@prospeccao:token', '@prospeccao:user']);
        setUser(null);
    }, []);

    useEffect(() => {
        // Registra o callback para que o interceptor do Axios notifique o estado quando ocorrer 401
        registerUnauthorizedHandler(() => {
            setUser(null);
        });

        return () => {
            registerUnauthorizedHandler(null);
        };
    }, []);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const storedUser = await AsyncStorage.getItem('@prospeccao:user');
                const storedToken = await AsyncStorage.getItem('@prospeccao:token');
                
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStorageData();
    }, []);

    async function login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        const { token, user: userData } = response.data;

        await AsyncStorage.setItem('@prospeccao:token', token);
        await AsyncStorage.setItem('@prospeccao:user', JSON.stringify(userData));

        setUser(userData);
    }

    async function register(name, email, password, companyName, document, avatarUri) {
        const payload = typeof name === 'object'
            ? name
            : { name, email, password, companyName, document, avatarUri };
        await api.post('/auth/register', payload);
    }

    return (
        <AuthContext.Provider value={{
            signed: !!user,
            user,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
