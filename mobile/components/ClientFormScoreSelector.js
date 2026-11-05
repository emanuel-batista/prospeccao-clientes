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

const PRESETS = [25, 50, 75, 100];

/**
 * ClientFormScoreSelector
 * Seletor de score enxuto e minimalista, sem poluição visual ou cartões aninhados.
 */
export default function ClientFormScoreSelector({
    value = 50,
    onChange,
    disabled = false,
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

    const currentScore = Math.max(0, Math.min(100, Number(value) || 0));

    const handleStep = (delta) => {
        if (disabled) return;
        const next = Math.max(0, Math.min(100, currentScore + delta));
        onChange(next);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.label, { fontFamily: fontSemiBold }]}>
                    Score Comercial
                </Text>
                <Text style={[styles.scoreValue, { fontFamily: fontSemiBold }]}>
                    {currentScore} <Text style={styles.scoreUnit}>/ 100</Text>
                </Text>
            </View>

            <View style={styles.controlsRow}>
                {/* Stepper compacto */}
                <View style={styles.stepper}>
                    <TouchableOpacity
                        onPress={() => handleStep(-10)}
                        disabled={disabled || currentScore <= 0}
                        activeOpacity={0.7}
                        style={[
                            styles.stepBtn,
                            (disabled || currentScore <= 0) && styles.stepBtnDisabled,
                        ]}
                        accessibilityLabel="Diminuir score em 10">
                        <MaterialIcons name="remove" size={16} color="#475569" />
                    </TouchableOpacity>

                    <Text style={[styles.stepperDisplay, { fontFamily: fontSemiBold }]}>
                        {currentScore}
                    </Text>

                    <TouchableOpacity
                        onPress={() => handleStep(10)}
                        disabled={disabled || currentScore >= 100}
                        activeOpacity={0.7}
                        style={[
                            styles.stepBtn,
                            (disabled || currentScore >= 100) && styles.stepBtnDisabled,
                        ]}
                        accessibilityLabel="Aumentar score em 10">
                        <MaterialIcons name="add" size={16} color="#475569" />
                    </TouchableOpacity>
                </View>

                {/* Presets rápidos */}
                <View style={styles.presets}>
                    {PRESETS.map((p) => {
                        const isSelected = currentScore === p;
                        return (
                            <TouchableOpacity
                                key={p}
                                onPress={() => !disabled && onChange(p)}
                                activeOpacity={0.75}
                                disabled={disabled}
                                style={[
                                    styles.presetChip,
                                    isSelected && styles.presetChipActive,
                                ]}>
                                <Text
                                    style={[
                                        styles.presetText,
                                        { fontFamily: isSelected ? fontSemiBold : fontMedium },
                                        isSelected && styles.presetTextActive,
                                    ]}>
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Barra fina de progresso */}
            <View style={styles.track}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${currentScore}%`,
                            backgroundColor:
                                currentScore >= 70
                                    ? '#D97706'
                                    : currentScore >= 40
                                    ? '#0284C7'
                                    : '#94A3B8',
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        width: '100%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        color: '#0F172A',
        letterSpacing: -0.1,
    },
    scoreValue: {
        fontSize: 15,
        color: '#080A96',
    },
    scoreUnit: {
        fontSize: 12,
        color: '#94A3B8',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 3,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    stepBtn: {
        width: 30,
        height: 30,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepBtnDisabled: {
        opacity: 0.35,
    },
    stepperDisplay: {
        minWidth: 36,
        textAlign: 'center',
        fontSize: 13,
        color: '#0F172A',
    },
    presets: {
        flexDirection: 'row',
        gap: 6,
    },
    presetChip: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    presetChipActive: {
        backgroundColor: '#080A96',
        borderColor: '#080A96',
    },
    presetText: {
        fontSize: 12,
        color: '#64748B',
    },
    presetTextActive: {
        color: '#FFFFFF',
    },
    track: {
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 2,
    },
});
