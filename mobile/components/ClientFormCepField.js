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
import { FONTS } from '../constants/fonts';
import api from '../services/api';

export function formatCepInput(text) {
    if (!text) return '';
    const digits = String(text).replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

export function extractCepDigits(text) {
    return String(text || '').replace(/\D/g, '');
}

/**
 * ClientFormCepField
 * Campo de CEP com máscara e busca automática via API de integração (ViaCEP).
 */
export default function ClientFormCepField({
    value,
    onChangeText,
    onAutofill,
    error,
    disabled = false,
}) {
    const fontSemiBold = FONTS.semiBold;
    const fontMedium = FONTS.medium;
    const fontRegular = FONTS.regular;

    const [isFocused, setIsFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

    const rawDigits = extractCepDigits(value);
    const isComplete = rawDigits.length === 8;

    const handleChange = (input) => {
        const masked = formatCepInput(input);
        onChangeText(masked);
        if (feedback) setFeedback(null);
    };

    const handleSearch = async () => {
        if (!isComplete || isSearching || disabled) return;

        setIsSearching(true);
        setFeedback(null);

        try {
            const res = await api.get(`/integrations/cep/${rawDigits}`);
            const data = res.data;

            if (data && (data.rua || data.cidade || data.bairro || data.estado)) {
                onAutofill?.({
                    cep: data.cep || maskedCep(rawDigits),
                    rua: data.rua || '',
                    complemento: data.complemento || '',
                    bairro: data.bairro || '',
                    cidade: data.cidade || '',
                    estado: data.estado || '',
                });
                setFeedback({
                    type: 'success',
                    text: 'Endereço localizado via CEP',
                });
            } else {
                setFeedback({
                    type: 'error',
                    text: 'CEP não localizado',
                });
            }
        } catch (err) {
            setFeedback({
                type: 'error',
                text: 'Não foi possível consultar este CEP',
            });
        } finally {
            setIsSearching(false);
        }
    };

    function maskedCep(digits) {
        return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    }

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, { fontFamily: fontSemiBold }]}>
                    CEP
                </Text>
                {rawDigits.length > 0 && rawDigits.length < 8 && (
                    <Text style={[styles.digitsHint, { fontFamily: fontRegular }]}>
                        {rawDigits.length}/8
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
                    name="place"
                    size={18}
                    color={error ? '#DC2626' : isFocused ? '#080A96' : '#94A3B8'}
                    style={styles.icon}
                />

                <TextInput
                    style={[styles.input, { fontFamily: fontMedium }]}
                    placeholder="00000-000"
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={handleChange}
                    keyboardType="numeric"
                    maxLength={9}
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
                        accessibilityLabel="Consultar CEP">
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

            {/* Feedback da busca */}
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
        marginBottom: 14,
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

