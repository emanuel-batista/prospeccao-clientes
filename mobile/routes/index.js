import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useAuth } from '../hooks/useAuth';
import AuthRoutes from './auth.routes';
import AppRoutes from './app.routes';

export default function Routes() {
    const { signed, loading } = useAuth();

    // Enquanto verifica o storage local na abertura (poucos ms),
    // mantém a tela limpa com a cor de fundo padrão, sem exibir tela cheia ou splash
    if (loading) {
        return <View style={styles.container} />;
    }

    return signed ? <AppRoutes /> : <AuthRoutes />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA',
    },
});
