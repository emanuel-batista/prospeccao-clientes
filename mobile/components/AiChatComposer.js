import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import {
    useFonts,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
} from '@expo-google-fonts/inter';

/**
 * AiChatComposer
 * Card flutuante futurístico de entrada de mensagens inspirado no template:
 * - Halo iridescente suave na borda superior (#38BDF8 -> #7C3AED -> #080A96).
 * - Área de texto limpa no topo e barra de ferramentas integrada na base com botão pílula "Enviar".
 */
export default function AiChatComposer({
    value,
    onChangeText,
    onSend,
    loading = false,
    clientContext = null,
    onClearClientContext,
}) {
    const [focused, setFocused] = useState(false);

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

    const canSend = Boolean(String(value || '').trim()) && !loading;

    const clientName =
        clientContext?.razao_social ||
        clientContext?.razaoSocial ||
        clientContext?.nomeFantasia ||
        clientContext?.name ||
        null;

    const handleKeyPress = (e) => {
        if (
            Platform.OS === 'web' &&
            e.nativeEvent.key === 'Enter' &&
            !e.nativeEvent.shiftKey
        ) {
            e.preventDefault();
            if (canSend) {
                onSend();
            }
        }
    };

    return (
        <View style={styles.outerWrapper}>
            {/* Halo luminoso iridescente no topo do card (igual ao efeito de luz do template) */}
            <View style={styles.ambientGlowContainer} pointerEvents="none">
                <Svg width="100%" height="26" viewBox="0 0 360 26" preserveAspectRatio="none">
                    <Defs>
                        <LinearGradient id="composerHalo" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                            <Stop offset="25%" stopColor="#38BDF8" stopOpacity="0.28" />
                            <Stop offset="55%" stopColor="#A855F7" stopOpacity="0.32" />
                            <Stop offset="80%" stopColor="#080A96" stopOpacity="0.24" />
                            <Stop offset="100%" stopColor="#080A96" stopOpacity="0" />
                        </LinearGradient>
                    </Defs>
                    <Rect x="10" y="2" width="340" height="24" rx="12" fill="url(#composerHalo)" />
                </Svg>
            </View>

            {/* Card Flutuante Principal */}
            <View style={[styles.composerCard, focused && styles.composerCardFocused]}>
                <TextInput
                    style={[styles.textInput, { fontFamily: fontRegular }]}
                    placeholder={
                        clientName
                            ? `Pergunte sobre ${clientName.split(' ')[0]}...`
                            : 'Pergunte qualquer coisa...'
                    }
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    maxLength={800}
                    editable={!loading}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyPress={handleKeyPress}
                    accessibilityLabel="Mensagem para o assistente de IA"
                />

                {/* Barra de Ações Inferior dentro do Card (igual ao template) */}
                <View style={styles.bottomBar}>
                    <View style={styles.leftTools}>
                        {clientName ? (
                            <View style={styles.clientPill}>
                                <MaterialIcons name="business" size={13} color="#080A96" />
                                <Text
                                    style={[styles.clientPillText, { fontFamily: fontMedium }]}
                                    numberOfLines={1}>
                                    {clientName.split(' ')[0]}
                                </Text>
                                {onClearClientContext ? (
                                    <TouchableOpacity
                                        onPress={onClearClientContext}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityLabel="Remover foco do cliente">
                                        <MaterialIcons name="close" size={13} color="#64748B" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.sparkleIconPod}>
                                <MaterialIcons name="auto-awesome" size={15} color="#7C3AED" />
                            </View>
                        )}

                        {value.length > 0 && !loading ? (
                            <TouchableOpacity
                                onPress={() => onChangeText('')}
                                style={styles.clearTextBtn}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityLabel="Limpar texto">
                                <Text style={[styles.clearTextLabel, { fontFamily: fontMedium }]}>
                                    Limpar
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Botão Pílula "Enviar" à direita */}
                    <TouchableOpacity
                        style={[
                            styles.sendPillButton,
                            canSend ? styles.sendPillActive : styles.sendPillDisabled,
                        ]}
                        onPress={onSend}
                        disabled={!canSend}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Enviar mensagem">
                        {loading ? (
                            <ActivityIndicator size="small" color="#7C3AED" />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="auto-awesome"
                                    size={14}
                                    color={canSend ? '#FFFFFF' : '#94A3B8'}
                                />
                                <Text
                                    style={[
                                        styles.sendPillText,
                                        {
                                            fontFamily: fontSemiBold,
                                            color: canSend ? '#FFFFFF' : '#94A3B8',
                                        },
                                    ]}>
                                    Enviar
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerWrapper: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 14 : 14,
        paddingTop: 2,
    },
    ambientGlowContainer: {
        marginBottom: -16,
        paddingHorizontal: 6,
        zIndex: 0,
    },
    composerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: '#EEF2FF',
        zIndex: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.07,
                shadowRadius: 16,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 6px 20px rgba(8, 10, 150, 0.07)',
            },
        }),
    },
    composerCardFocused: {
        borderColor: '#C7D2FE',
    },
    textInput: {
        fontSize: 14,
        color: '#0F172A',
        minHeight: 38,
        maxHeight: 96,
        paddingVertical: 0,
        marginBottom: 10,
        ...Platform.select({
            web: {
                outline: 'none',
            },
        }),
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftTools: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        marginRight: 10,
    },
    sparkleIconPod: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        maxWidth: 170,
    },
    clientPillText: {
        fontSize: 11.5,
        color: '#080A96',
    },
    clearTextBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    clearTextLabel: {
        fontSize: 11.5,
        color: '#94A3B8',
    },
    sendPillButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 18,
        minWidth: 88,
    },
    sendPillActive: {
        backgroundColor: '#080A96',
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.22,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 3px 10px rgba(8, 10, 150, 0.22)',
            },
        }),
    },
    sendPillDisabled: {
        backgroundColor: '#F1F5F9',
    },
    sendPillText: {
        fontSize: 12.5,
        letterSpacing: 0.1,
    },
});
