import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import {
    useFonts,
    Inter_600SemiBold,
    Inter_500Medium,
} from '@expo-google-fonts/inter';

export const POTENTIAL_OPTIONS = [
    { id: 'Baixo', label: 'Baixo', color: '#64748B' },
    { id: 'Médio', label: 'Médio', color: '#0284C7' },
    { id: 'Alto', label: 'Alto', color: '#D97706' },
];

/**
 * ClientFormPotentialSelector
 * Controle segmentado minimalista para o potencial de compra.
 */
export default function ClientFormPotentialSelector({
    value = 'Médio',
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
                Potencial de Compra
            </Text>

            <View style={styles.segmentTrack}>
                {POTENTIAL_OPTIONS.map((item) => {
                    const isSelected = value === item.id;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => !disabled && onChange(item.id)}
                            activeOpacity={0.8}
                            disabled={disabled}
                            style={[
                                styles.segmentButton,
                                isSelected && styles.segmentButtonActive,
                            ]}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}>
                            <Text
                                style={[
                                    styles.segmentText,
                                    {
                                        fontFamily: isSelected ? fontSemiBold : fontMedium,
                                        color: isSelected ? '#080A96' : '#64748B',
                                    },
                                ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
    segmentTrack: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
        padding: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    segmentButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        borderRadius: 8,
    },
    segmentButtonActive: {
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            },
        }),
    },
    segmentText: {
        fontSize: 13,
        letterSpacing: -0.1,
    },
});
