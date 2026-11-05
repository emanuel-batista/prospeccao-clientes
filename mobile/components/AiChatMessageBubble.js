import React, { useState, useEffect } from 'react';
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
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
} from '@expo-google-fonts/inter';
import AiOrb from './AiOrb';

/**
 * Renderiza trechos inline com suporte a **negrito** sem exibir asteriscos brutos
 */
function renderInlineText(text, baseStyle, boldStyle) {
    if (!text) return null;
    const parts = String(text).split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
                <Text key={idx} style={[baseStyle, boldStyle]}>
                    {part.slice(2, -2)}
                </Text>
            );
        }
        return <Text key={idx} style={baseStyle}>{part}</Text>;
    });
}

/**
 * Parser leve para formatar respostas Markdown do Gemini em blocos limpos de UI
 */
function FormattedAiText({ content, fontRegular, fontSemiBold, fontBold }) {
    if (!content) return null;

    const lines = String(content).replace(/\r\n/g, '\n').split('\n');

    return (
        <View style={styles.formattedContainer}>
            {lines.map((rawLine, index) => {
                const line = rawLine.trim();

                if (!line) {
                    return <View key={index} style={styles.paragraphSpacer} />;
                }

                // Títulos Markdown (#, ##, ###)
                if (/^#{1,3}\s+/.test(line)) {
                    const cleanHeading = line.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '');
                    return (
                        <Text
                            key={index}
                            style={[styles.headingText, { fontFamily: fontBold }]}
                            selectable>
                            {cleanHeading}
                        </Text>
                    );
                }

                // Lista com marcadores (-, *, •)
                if (/^([-*•])\s+/.test(line)) {
                    const itemText = line.replace(/^([-*•])\s+/, '');
                    return (
                        <View key={index} style={styles.bulletRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.bulletContent} selectable>
                                {renderInlineText(
                                    itemText,
                                    [styles.assistantBodyText, { fontFamily: fontRegular }],
                                    { fontFamily: fontSemiBold, color: '#0F172A' }
                                )}
                            </Text>
                        </View>
                    );
                }

                // Lista numerada (1., 2., etc.)
                const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
                if (numberedMatch) {
                    const [, num, itemText] = numberedMatch;
                    return (
                        <View key={index} style={styles.numberedRow}>
                            <Text style={[styles.numberPrefix, { fontFamily: fontSemiBold }]}>
                                {num}.
                            </Text>
                            <Text style={styles.bulletContent} selectable>
                                {renderInlineText(
                                    itemText,
                                    [styles.assistantBodyText, { fontFamily: fontRegular }],
                                    { fontFamily: fontSemiBold, color: '#0F172A' }
                                )}
                            </Text>
                        </View>
                    );
                }

                // Parágrafo padrão
                return (
                    <Text key={index} style={styles.paragraphLine} selectable>
                        {renderInlineText(
                            line,
                            [styles.assistantBodyText, { fontFamily: fontRegular }],
                            { fontFamily: fontSemiBold, color: '#0F172A' }
                        )}
                    </Text>
                );
            })}
        </View>
    );
}

/**
 * AiChatMessageBubble
 * Visual futurístico e minimalista inspirado no template:
 * - Sem badges, sem títulos de cabeçalho repetidos, sem caixas de alerta poluídas.
 * - Apenas o Usuário (pílula à direita) e a IA (mini esfera 3D iridescente + balão branco suave à esquerda).
 * - Quando a IA está indisponível ou com alta demanda, responde de forma serena em um único balão limpo.
 */
export default function AiChatMessageBubble({
    message,
    onRetry,
    onRestorePrompt,
}) {
    const [copied, setCopied] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);

    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_600SemiBold,
        Inter_500Medium,
        Inter_400Regular,
    });

    const fontBold = fontsLoaded
        ? 'Inter_700Bold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontSemiBold = fontsLoaded
        ? 'Inter_600SemiBold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded
        ? 'Inter_500Medium'
        : Platform.select({ ios: 'System', android: 'sans-serif' });
    const fontRegular = fontsLoaded
        ? 'Inter_400Regular'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    const isUser = message.role === 'user';
    const isError = Boolean(message.isError);
    const isLoading = Boolean(message.isLoading);

    useEffect(() => {
        if (!isLoading) {
            setLoadingStage(0);
            return;
        }

        const timer1 = setTimeout(() => setLoadingStage(1), 3000);
        const timer2 = setTimeout(() => setLoadingStage(2), 7000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [isLoading]);

    const handleCopy = async () => {
        if (!message.text) return;
        try {
            if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(message.text);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    };

    // 1. Mensagem do Usuário (Pílula limpa à direita + horário abaixo)
    if (isUser) {
        return (
            <View style={styles.userContainer}>
                <View style={styles.userBubble}>
                    <Text
                        style={[styles.userText, { fontFamily: fontRegular }]}
                        selectable>
                        {message.text}
                    </Text>
                </View>
                {message.timestamp ? (
                    <Text style={[styles.timestampRight, { fontFamily: fontRegular }]}>
                        {message.timestamp}
                    </Text>
                ) : null}
            </View>
        );
    }

    // 2. Mensagem da IA (Mini Esfera 3D + Balão Branco Minimalista — único ponto de comunicação)
    const thinkingTexts = [
        'Analisando sua solicitação...',
        'Consultando dados da carteira...',
        'Alta demanda no momento, aguardando resposta...',
    ];

    return (
        <View style={styles.aiContainer}>
            <View style={styles.aiRow}>
                {/* Mini Esfera 3D Iridescente como único avatar da IA */}
                <View style={styles.orbAvatarWrapper}>
                    <AiOrb size={32} isThinking={isLoading} />
                </View>

                <View style={styles.aiColumn}>
                    <View style={styles.aiBubble}>
                        {isLoading ? (
                            <Text style={[styles.thinkingText, { fontFamily: fontRegular }]}>
                                {thinkingTexts[loadingStage] || thinkingTexts[0]}
                            </Text>
                        ) : (
                            <FormattedAiText
                                content={message.text}
                                fontRegular={fontRegular}
                                fontSemiBold={fontSemiBold}
                                fontBold={fontBold}
                            />
                        )}
                    </View>

                    {/* Rodapé minimalista abaixo do balão (horário à esquerda, ícones discretos à direita) */}
                    {!isLoading && (
                        <View style={styles.aiMetaRow}>
                            <Text style={[styles.timestampLeft, { fontFamily: fontRegular }]}>
                                {message.timestamp || ''}
                            </Text>

                            <View style={styles.metaIconsGroup}>
                                {isError && onRetry && message.originalPrompt ? (
                                    <TouchableOpacity
                                        style={styles.retryInlineBtn}
                                        onPress={() => onRetry(message.originalPrompt, message.id)}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Tentar novamente">
                                        <MaterialIcons name="refresh" size={14} color="#080A96" />
                                        <Text
                                            style={[
                                                styles.retryInlineText,
                                                { fontFamily: fontMedium },
                                            ]}>
                                            Tentar novamente
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}

                                {isError && onRestorePrompt && message.originalPrompt ? (
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={() => onRestorePrompt(message.originalPrompt)}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityRole="button"
                                        accessibilityLabel="Editar pergunta">
                                        <MaterialIcons name="edit" size={14} color="#94A3B8" />
                                    </TouchableOpacity>
                                ) : null}

                                {!isError && (
                                    <>
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={handleCopy}
                                            activeOpacity={0.7}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            accessibilityRole="button"
                                            accessibilityLabel="Copiar resposta">
                                            <MaterialIcons
                                                name={copied ? 'check' : 'content-copy'}
                                                size={14}
                                                color={copied ? '#059669' : '#94A3B8'}
                                            />
                                        </TouchableOpacity>

                                        {onRetry && message.originalPrompt ? (
                                            <TouchableOpacity
                                                style={styles.iconBtn}
                                                onPress={() =>
                                                    onRetry(message.originalPrompt, message.id)
                                                }
                                                activeOpacity={0.7}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                accessibilityRole="button"
                                                accessibilityLabel="Gerar novamente">
                                                <MaterialIcons
                                                    name="refresh"
                                                    size={15}
                                                    color="#94A3B8"
                                                />
                                            </TouchableOpacity>
                                        ) : null}
                                    </>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Usuário (Direita)
    userContainer: {
        alignItems: 'flex-end',
        marginBottom: 18,
        paddingLeft: 52,
    },
    userBubble: {
        backgroundColor: '#080A96',
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 20,
        borderBottomRightRadius: 6,
        maxWidth: '100%',
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.16,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 3px 10px rgba(8, 10, 150, 0.16)',
            },
        }),
    },
    userText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 20,
    },
    timestampRight: {
        fontSize: 10.5,
        color: '#94A3B8',
        marginTop: 5,
        marginRight: 4,
    },

    // Assistente IA (Esquerda — Esfera + Balão Branco Limpo)
    aiContainer: {
        marginBottom: 20,
        paddingRight: 20,
    },
    aiRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    orbAvatarWrapper: {
        marginRight: 10,
        marginTop: 2,
    },
    aiColumn: {
        flex: 1,
    },
    aiBubble: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderTopLeftRadius: 6,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            },
        }),
    },
    thinkingText: {
        fontSize: 13.5,
        color: '#64748B',
        lineHeight: 20,
    },

    // Rodapé abaixo do balão da IA (igual ao template: horário + ícones)
    aiMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingHorizontal: 4,
    },
    timestampLeft: {
        fontSize: 10.5,
        color: '#94A3B8',
    },
    metaIconsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 2,
    },
    retryInlineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 6,
    },
    retryInlineText: {
        fontSize: 11.5,
        color: '#080A96',
    },

    // Formatação interna do texto
    formattedContainer: {
        width: '100%',
    },
    paragraphSpacer: {
        height: 7,
    },
    headingText: {
        fontSize: 14.5,
        color: '#0F172A',
        marginTop: 3,
        marginBottom: 5,
        letterSpacing: -0.2,
    },
    paragraphLine: {
        marginBottom: 3,
    },
    assistantBodyText: {
        fontSize: 13.5,
        color: '#1E293B',
        lineHeight: 20,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        paddingLeft: 2,
    },
    bulletDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#7C3AED',
        marginTop: 7.5,
        marginRight: 8,
    },
    numberedRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        paddingLeft: 2,
    },
    numberPrefix: {
        fontSize: 13,
        color: '#080A96',
        marginRight: 6,
        lineHeight: 20,
    },
    bulletContent: {
        flex: 1,
    },
});
