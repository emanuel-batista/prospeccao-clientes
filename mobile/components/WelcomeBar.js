import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_700Bold, Inter_500Medium, Inter_400Regular } from '@expo-google-fonts/inter';

/**
 * WelcomeBar (Sway Finance / Modern Fintech Light Theme)
 * 
 * Barra superior contemporânea em tema claro:
 * - Avatar do vendedor com aro de contraste e iniciais defensivas
 * - Saudação e empresa com indicador de status online/offline
 * - Botão de logout sutil com confirmação nativa de saída
 */
export default function WelcomeBar({ user, onLogout, isOffline = false }) {
    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_500Medium,
        Inter_400Regular,
    });

    const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded ? 'Inter_500Medium' : Platform.select({ ios: 'System', android: 'sans-serif' });
    const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.select({ ios: 'System', android: 'sans-serif' });

    const getFirstName = () => {
        if (!user || typeof user.name !== 'string' || !user.name.trim()) {
            return 'Vendedor';
        }
        const cleaned = user.name.trim().split(/\s+/).filter(Boolean);
        return cleaned.length > 0 ? cleaned[0] : 'Vendedor';
    };

    const company = (user && typeof user.companyName === 'string' && user.companyName.trim())
        ? user.companyName.trim()
        : 'Painel Comercial';

    const getInitials = () => {
        if (!user || typeof user.name !== 'string' || !user.name.trim()) {
            return 'VD';
        }
        const parts = user.name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'VD';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    };

    function handleLogoutPress() {
        Alert.alert(
            'Sair da Conta',
            'Deseja realmente encerrar sua sessão e sair do aplicativo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => {
                        if (typeof onLogout === 'function') {
                            onLogout();
                        }
                    },
                },
            ]
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.userInfo}>
                <View style={styles.avatarWrapper}>
                    {user?.avatarUri ? (
                        <Image
                            source={{ uri: user.avatarUri }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.initialsContainer}>
                            <Text style={[styles.initialsText, { fontFamily: fontBold }]}>
                                {getInitials()}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.greetingLabel, { fontFamily: fontRegular }]}>
                        Olá, <Text style={{ fontFamily: fontBold, color: '#0F172A' }}>{getFirstName()}</Text> 👋
                    </Text>
                    <View style={styles.companyRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isOffline ? '#F59E0B' : '#10B981' },
                            ]}
                        />
                        <Text
                            style={[styles.companyText, { fontFamily: fontMedium }]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {isOffline ? 'Offline • Servidor inacessível' : company}
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleLogoutPress}
                activeOpacity={0.7}
                style={styles.logoutButton}
                accessibilityLabel="Encerrar sessão"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="logout" size={19} color="#64748B" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    avatarWrapper: {
        width: 46,
        height: 46,
        borderRadius: 23,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: '#E2E8F0',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
            },
        }),
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    initialsContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        fontSize: 16,
        color: '#080A96',
        letterSpacing: 0.5,
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    greetingLabel: {
        fontSize: 16,
        color: '#475569',
        letterSpacing: -0.2,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 6,
    },
    companyText: {
        fontSize: 12,
        color: '#64748B',
        flexShrink: 1,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
            },
        }),
    },
});
