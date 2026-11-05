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
} from '@expo-google-fonts/inter';

/**
 * ClientEmptyState
 * Estado limpo e objetivo para quando a lista de clientes estiver vazia.
 * Sem emojis ou descrições excessivas.
 */
export default function ClientEmptyState({
    isFiltered = false,
    onResetFilters,
    onNewClient,
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_500Medium,
    });

    const fontSemiBold = fontsLoaded
        ? 'Inter_600SemiBold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded
        ? 'Inter_500Medium'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    if (isFiltered) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name="search-off" size={32} color="#64748B" />
                </View>

                <Text style={[styles.title, { fontFamily: fontMedium }]}>
                    Nenhum cliente encontrado
                </Text>

                {onResetFilters && (
                    <TouchableOpacity
                        onPress={onResetFilters}
                        activeOpacity={0.8}
                        style={styles.actionButton}
                        accessibilityRole="button">
                        <Text style={[styles.actionText, { fontFamily: fontSemiBold }]}>
                            Limpar filtros
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconCircle}>
                <MaterialIcons name="format-list-bulleted" size={32} color="#64748B" />
            </View>

            <Text style={[styles.title, { fontFamily: fontMedium }]}>
                Não há clientes cadastrados
            </Text>

            {onNewClient && (
                <TouchableOpacity
                    onPress={onNewClient}
                    activeOpacity={0.8}
                    style={styles.actionButton}
                    accessibilityRole="button">
                    <Text style={[styles.actionText, { fontFamily: fontSemiBold }]}>
                        Cadastrar cliente
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
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.2,
    },
    actionButton: {
        paddingVertical: 9,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
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
    actionText: {
        fontSize: 13,
        color: '#080A96',
    },
});
