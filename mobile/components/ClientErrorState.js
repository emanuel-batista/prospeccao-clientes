import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    useFonts,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
} from '@expo-google-fonts/inter';

/**
 * ClientErrorState
 * 
 * Implementação da 9ª Heurística de Nielsen:
 * "Ajudar os usuários a reconhecer, diagnosticar e recuperar de erros"
 * 
 * - Reconhecer: Ícone visual evidente de falha de conexão e status claro.
 * - Diagnosticar: Mensagem simples explicando que houve perda de comunicação com o servidor.
 * - Recuperar: Botão direto para tentar restabelecer a conexão sem recarregar o app.
 */
export default function ClientErrorState({
    title = 'Sem conexão com o servidor',
    message = 'Não foi possível carregar a lista de clientes. Verifique sua conexão com a internet e tente novamente.',
    onRetry,
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_500Medium,
        Inter_400Regular,
    });

    const fontSemiBold = fontsLoaded
        ? 'Inter_600SemiBold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded
        ? 'Inter_500Medium'
        : Platform.select({ ios: 'System', android: 'sans-serif' });
    const fontRegular = fontsLoaded
        ? 'Inter_400Regular'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconCircle}>
                <MaterialIcons name="cloud-off" size={32} color="#DC2626" />
            </View>

            <Text style={[styles.title, { fontFamily: fontSemiBold }]}>
                {title}
            </Text>

            <Text style={[styles.message, { fontFamily: fontRegular }]}>
                {message}
            </Text>

            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    activeOpacity={0.8}
                    style={styles.retryButton}
                    accessibilityRole="button"
                    accessibilityLabel="Tentar reconectar">
                    <MaterialIcons name="refresh" size={18} color="#080A96" />
                    <Text style={[styles.retryText, { fontFamily: fontMedium }]}>
                        Tentar novamente
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 56,
        paddingHorizontal: 28,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.2,
    },
    message: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 19,
        maxWidth: 300,
        marginBottom: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            },
        }),
    },
    retryText: {
        fontSize: 13,
        color: '#080A96',
    },
});

