import React from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';

/**
 * ClientSearchBar
 * Componente de busca limpo e minimalista para filtragem de clientes por razão social ou CNPJ.
 */
export default function ClientSearchBar({
    value,
    onChangeText,
    onClear,
    placeholder = 'Buscar por razão social ou CNPJ...',
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
    });

    const fontRegular = fontsLoaded
        ? 'Inter_400Regular'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    const hasText = Boolean(value && value.trim().length > 0);

    return (
        <View style={[styles.container, style]}>
            <MaterialIcons
                name="search"
                size={20}
                color="#64748B"
                style={styles.searchIcon}
            />

            <TextInput
                style={[styles.input, { fontFamily: fontRegular }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="never"
                returnKeyType="search"
            />

            {hasText && (
                <TouchableOpacity
                    onPress={onClear}
                    style={styles.clearButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Limpar busca"
                    accessibilityRole="button">
                    <MaterialIcons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        height: 44,
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            },
        }),
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
});

