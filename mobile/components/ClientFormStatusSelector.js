import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import {
    useFonts,
    Inter_600SemiBold,
    Inter_500Medium,
} from '@expo-google-fonts/inter';

export const STATUS_OPTIONS = [
    { id: 'Novo', label: 'Novo', color: '#0284C7' },
    { id: 'Em Contato', label: 'Contato', color: '#7C3AED' },
    { id: 'Em Negociação', label: 'Negociação', color: '#D97706' },
    { id: 'Fechado', label: 'Fechado', color: '#059669' },
    { id: 'Perdido', label: 'Perdido', color: '#DC2626' },
];

/**
 * ClientFormStatusSelector
 * Seletor minimalista e horizontal de estágio do funil (sem cartões aninhados).
 */
export default function ClientFormStatusSelector({
    value = 'Novo',
    onChange,
    disabled = false,
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

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { fontFamily: fontSemiBold }]}>
                Estágio no Funil
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollRow}>
                {STATUS_OPTIONS.map((item) => {
                    const isSelected = value === item.id;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => !disabled && onChange(item.id)}
                            activeOpacity={0.7}
                            disabled={disabled}
                            style={[
                                styles.pill,
                                isSelected
                                    ? [styles.pillActive, { backgroundColor: item.color }]
                                    : styles.pillInactive,
                            ]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}>
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: isSelected
                                            ? '#FFFFFF'
                                            : item.color,
                                    },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.pillText,
                                    {
                                        fontFamily: isSelected ? fontSemiBold : fontMedium,
                                        color: isSelected ? '#FFFFFF' : '#475569',
                                    },
                                ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 13,
        color: '#0F172A',
        marginBottom: 8,
        letterSpacing: -0.1,
    },
    scrollRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 2,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
    },
    pillInactive: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    pillActive: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    pillText: {
        fontSize: 13,
        letterSpacing: -0.1,
    },
});
