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
    Inter_400Regular,
} from '@expo-google-fonts/inter';

/**
 * ClientEmptyState
 * Estado vazio clean e intuitivo exibido quando a lista está sem itens.
 */
export default function ClientEmptyState({
    isFiltered = false,
    onResetFilters,
    onNewClient,
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_400Regular,
    });

    const fontSemiBold = fontsLoaded
        ? 'Inter_600SemiBold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontRegular = fontsLoaded
        ? 'Inter_400Regular'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    const title = isFiltered
        ? 'Nenhum cliente encontrado'
        : 'Nenhum cliente cadastrado';

    const description = isFiltered
        ? 'Tente ajustar os termos de busca ou alterar o filtro selecionado.'
        : 'Cadastre sua primeira oportunidade comercial para iniciar a prospecção.';

    const actionText = isFiltered ? 'Limpar filtros' : 'Cadastrar cliente';
    const handleAction = isFiltered ? onResetFilters : onNewClient;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.iconCircle}>
                <MaterialIcons
                    name={isFiltered ? 'search-off' : 'business'}
                    size={32}
                    color="#64748B"
                />
            </View>

            <Text style={[styles.title, { fontFamily: fontSemiBold }]}>
                {title}
            </Text>

            <Text style={[styles.description, { fontFamily: fontRegular }]}>
                {description}
            </Text>

            {handleAction && (
                <TouchableOpacity
                    onPress={handleAction}
                    activeOpacity={0.8}
                    style={styles.actionButton}
                    accessibilityRole="button">
                    <Text style={[styles.actionText, { fontFamily: fontSemiBold }]}>
                        {actionText}
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
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    description: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 280,
        marginBottom: 20,
    },
    actionButton: {
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
    actionText: {
        fontSize: 13,
        color: '#080A96',
    },
});

