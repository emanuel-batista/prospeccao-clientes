import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
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
import api from '../services/api';

export function formatCnpjInput(text) {
    if (!text) return '';
    const digits = String(text).replace(/\D/g, '').slice(0, 14);

    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
}

export function extractCnpjDigits(text) {
    return String(text || '').replace(/\D/g, '');
}

/**
 * ClientFormCnpjField
 * Campo de CNPJ limpo e funcional com busca integrada sem cards aninhados.
 */
export default function ClientFormCnpjField({
    value,
    onChangeText,
    onAutofill,
    error,
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

    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

    const rawDigits = extractCnpjDigits(value);
    const isComplete = rawDigits.length === 14;

    const handleChange = (input) => {
        const masked = formatCnpjInput(input);
        onChangeText(masked);
        if (feedback) setFeedback(null);
    };

    const handleSearch = async () => {
        if (!isComplete || isSearching || disabled) return;

        setIsSearching(true);
        setFeedback(null);

        try {
            const res = await api.get(`/integrations/cnpj/${rawDigits}`);
            const data = res.data;

            if (data && (data.razaoSocial || data.razao_social)) {
                const razaoSocial = data.razaoSocial || data.razao_social || '';
                onAutofill?.({
                    razaoSocial,
                    nomeFantasia: data.nomeFantasia || '',
                    cidade: data.cidade || '',
                    estado: data.estado || '',
                });
                setFeedback({
                    type: 'success',
                    text: 'Dados preenchidos via Receita Federal',
                });
            } else {
                setFeedback({
                    type: 'error',
                    text: 'CNPJ não localizado na Receita',
                });
            }
        } catch (err) {
            setFeedback({
                type: 'error',
                text: 'Não foi possível consultar este CNPJ',
            });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, { fontFamily: fontSemiBold }]}>
                    CNPJ <Text style={styles.required}>*</Text>
                </Text>
                {rawDigits.length > 0 && rawDigits.length < 14 && (
                    <Text style={[styles.digitsHint, { fontFamily: fontRegular }]}>
                        {rawDigits.length}/14
                    </Text>
                )}
            </View>

            <View
                style={[
                    styles.inputRow,
                    isFocused && styles.inputRowFocused,
                    error && styles.inputRowError,
                    disabled && styles.inputRowDisabled,
                ]}>
                <MaterialIcons
                    name="domain"
                    size={18}
                    color={error ? '#DC2626' : isFocused ? '#080A96' : '#94A3B8'}
                    style={styles.icon}
                />

                <TextInput
                    style={[styles.input, { fontFamily: fontMedium }]}
                    placeholder="00.000.000/0000-00"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={handleChange}
                    keyboardType="numeric"
                    maxLength={18}
                    editable={!disabled && !isSearching}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />

                {isComplete && (
                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={isSearching || disabled}
                        activeOpacity={0.7}
                        style={styles.searchBtn}
                        accessibilityLabel="Consultar Receita Federal">
                        {isSearching ? (
                            <ActivityIndicator size="small" color="#080A96" />
                        ) : (
                            <Text style={[styles.searchBtnText, { fontFamily: fontSemiBold }]}>
                                Buscar
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Mensagem de erro de validação */}
            {error ? (
                <Text style={[styles.errorText, { fontFamily: fontRegular }]}>
                    {error}
                </Text>
            ) : null}

            {/* Feedback discreto da busca (sem card) */}
            {feedback ? (
                <View style={styles.feedbackRow}>
                    <MaterialIcons
                        name={feedback.type === 'success' ? 'check-circle' : 'info'}
                        size={13}
                        color={feedback.type === 'success' ? '#059669' : '#DC2626'}
                    />
                    <Text
                        style={[
                            styles.feedbackText,
                            {
                                fontFamily: fontRegular,
                                color: feedback.type === 'success' ? '#059669' : '#DC2626',
                            },
                        ]}>
                        {feedback.text}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        color: '#0F172A',
        letterSpacing: -0.1,
    },
    required: {
        color: '#DC2626',
    },
    digitsHint: {
        fontSize: 11,
        color: '#94A3B8',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
    },
    inputRowFocused: {
        borderColor: '#080A96',
        ...Platform.select({
            web: {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(8, 10, 150, 0.1)',
            },
        }),
    },
    inputRowError: {
        borderColor: '#DC2626',
    },
    inputRowDisabled: {
        backgroundColor: '#F8FAFC',
        opacity: 0.6,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        paddingVertical: 0,
    },
    searchBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 6,
    },
    searchBtnText: {
        fontSize: 12,
        color: '#080A96',
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 4,
        paddingLeft: 2,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 5,
        paddingLeft: 2,
    },
    feedbackText: {
        fontSize: 12,
    },
});
