import React, {
    useState,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import api from '../../services/api';
import {
    Logo,
    AiChatMessageBubble,
    AiChatPromptSuggestions,
    AiChatComposer,
} from '../../components';

/**
 * Formata hora atual (HH:MM) para o rodapé das mensagens
 */
function getCurrentTimeFormatted() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Converte falhas da API em uma resposta única, serena e direta da própria IA,
 * evitando poluição visual de múltiplos alertas/badges na tela.
 */
function getFriendlyAiFallbackMessage(err) {
    const status = err?.response?.status;
    const rawServerMsg =
        err?.response?.data?.message ||
        err?.response?.data?.erro ||
        err?.message ||
        '';
    const lowerMsg = String(rawServerMsg).toLowerCase();

    const isNetworkOrTimeout =
        !err?.response ||
        err?.code === 'ECONNABORTED' ||
        err?.code === 'ERR_NETWORK' ||
        lowerMsg.includes('network error') ||
        lowerMsg.includes('timeout') ||
        lowerMsg.includes('failed to fetch') ||
        lowerMsg.includes('connect');

    if (isNetworkOrTimeout) {
        const isTimeout =
            err?.code === 'ECONNABORTED' || lowerMsg.includes('timeout');

        if (isTimeout) {
            return 'Estou com alta demanda de processamento neste instante e a consulta demorou além do limite esperado. Aguarde alguns segundos e toque em **Tentar novamente** abaixo.';
        }

        return 'Não consegui comunicação com o servidor no momento. Verifique sua conexão e toque em **Tentar novamente** abaixo.';
    }

    if (
        lowerMsg.includes('gemini_api_key') ||
        lowerMsg.includes('api_key') ||
        lowerMsg.includes('api key')
    ) {
        return 'A chave de integração **GEMINI_API_KEY** ainda não foi configurada ou está inválida no servidor backend.';
    }

    const isOverloadedOrQuota =
        status === 503 ||
        status === 429 ||
        status === 502 ||
        status === 504 ||
        lowerMsg.includes('503') ||
        lowerMsg.includes('429') ||
        lowerMsg.includes('unavailable') ||
        lowerMsg.includes('overloaded') ||
        lowerMsg.includes('quota') ||
        lowerMsg.includes('resource_exhausted') ||
        lowerMsg.includes('rate limit') ||
        lowerMsg.includes('high demand');

    if (isOverloadedOrQuota) {
        return 'Estou passando por um pico de demanda no momento e não consegui concluir a leitura da sua carteira agora. Seus dados estão seguros — aguarde alguns instantes e toque em **Tentar novamente**.';
    }

    return 'Estou temporariamente indisponível devido a uma instabilidade momentânea no serviço. Toque em **Tentar novamente** abaixo para reenviar sua pergunta.';
}

/**
 * AiChatScreen
 * Interface futurística e minimalista de Assistente de IA inspirada no template:
 * - Cabeçalho limpo sem badges (botão circular de voltar, marca central sutil e ação circular à direita).
 * - Esfera 3D iridescente centralizada no estado inicial.
 * - Conversa limpa apenas entre Usuário e IA, comunicando instabilidades em um único balão sereno.
 * - Sugestões em pílulas flutuantes acima do card de mensagem iluminado.
 */
export default function AiChatScreen({ navigation, route }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const [clientContext, setClientContext] = useState(
        () => route.params?.client || null
    );

    const flatListRef = useRef(null);
    const processedInitialPromptRef = useRef('');
    const isSendingRef = useRef(false);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
    }, [messages.length]);

    const sendMessage = useCallback(
        async (customPrompt = null, retryMessageId = null) => {
            const promptToSend = String(
                customPrompt !== null ? customPrompt : inputText
            ).trim();

            if (!promptToSend || isSendingRef.current) return;

            isSendingRef.current = true;
            setLoading(true);

            if (customPrompt === null) {
                setInputText('');
            }

            const nowTime = getCurrentTimeFormatted();
            const userMsgId = `user_${Date.now()}`;
            const loadingMsgId = `loading_${Date.now() + 1}`;

            setMessages((prev) => {
                const filtered = retryMessageId
                    ? prev.filter((m) => m.id !== retryMessageId)
                    : [
                          ...prev,
                          {
                              id: userMsgId,
                              role: 'user',
                              text: promptToSend,
                              timestamp: nowTime,
                          },
                      ];

                return [
                    ...filtered,
                    {
                        id: loadingMsgId,
                        role: 'assistant',
                        isLoading: true,
                    },
                ];
            });

            scrollToBottom();

            try {
                const response = await api.post(
                    '/ai/chat',
                    { message: promptToSend },
                    { timeout: 25000 }
                );

                const replyText =
                    response.data?.reply ||
                    response.data?.response ||
                    response.data?.message ||
                    'Análise concluída.';

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingMsgId
                            ? {
                                  id: `ai_${Date.now()}`,
                                  role: 'assistant',
                                  text: replyText,
                                  originalPrompt: promptToSend,
                                  timestamp: getCurrentTimeFormatted(),
                                  isLoading: false,
                                  isError: false,
                              }
                            : m
                    )
                );
            } catch (err) {
                const friendlyFallback = getFriendlyAiFallbackMessage(err);

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingMsgId
                            ? {
                                  id: `err_${Date.now()}`,
                                  role: 'assistant',
                                  isLoading: false,
                                  isError: true,
                                  text: friendlyFallback,
                                  originalPrompt: promptToSend,
                                  timestamp: getCurrentTimeFormatted(),
                              }
                            : m
                    )
                );
            } finally {
                isSendingRef.current = false;
                setLoading(false);
                scrollToBottom();
            }
        },
        [inputText, scrollToBottom]
    );

    useEffect(() => {
        if (route.params?.client) {
            setClientContext(route.params.client);
        }

        const initialPrompt = route.params?.initialPrompt;
        if (
            initialPrompt &&
            processedInitialPromptRef.current !== initialPrompt
        ) {
            processedInitialPromptRef.current = initialPrompt;
            sendMessage(initialPrompt);
        }
    }, [route.params?.client, route.params?.initialPrompt, sendMessage]);

    const handleClearChat = () => {
        if (messages.length === 0 || loading) return;

        const doClear = () => {
            setMessages([]);
        };

        const msg = 'Deseja iniciar uma nova conversa limpa?';
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm(msg)) {
                doClear();
            }
        } else {
            Alert.alert('Nova conversa', msg, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpar', style: 'destructive', onPress: doClear },
            ]);
        }
    };

    const handleRestorePrompt = (promptText) => {
        if (!promptText) return;
        setInputText(promptText);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Luz ambiente sutil de fundo (estilo futurístico do template na nossa paleta) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
                    <Defs>
                        <RadialGradient
                            id="bgAuraTop"
                            cx="50%"
                            cy="36%"
                            rx="65%"
                            ry="35%"
                            fx="50%"
                            fy="36%">
                            <Stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.38" />
                            <Stop offset="50%" stopColor="#E0E7FF" stopOpacity="0.22" />
                            <Stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="400" height="800" fill="url(#bgAuraTop)" />
                </Svg>
            </View>

            {/* 1. Header Minimalista (Sem badges, apenas botões circulares e marca central) */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.circleHeaderBtn}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar">
                    <MaterialIcons name="arrow-back" size={20} color="#0F172A" />
                </TouchableOpacity>

                <View style={styles.centerBrandMark}>
                    <Logo size={24} color="#080A96" />
                </View>

                {messages.length > 0 ? (
                    <TouchableOpacity
                        onPress={handleClearChat}
                        disabled={loading}
                        style={[
                            styles.circleHeaderBtn,
                            loading && styles.btnDisabled,
                        ]}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel="Nova conversa">
                        <MaterialIcons name="restart-alt" size={20} color="#0F172A" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ClientsList')}
                        style={styles.circleHeaderBtn}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel="Ver lista de clientes">
                        <MaterialIcons name="people-outline" size={19} color="#0F172A" />
                    </TouchableOpacity>
                )}
            </View>

            {/* 2. Área Central: Esfera 3D no Zero-State ou Fluxo Limpo de Conversa */}
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AiChatMessageBubble
                            message={item}
                            onRetry={(promptText, errId) =>
                                sendMessage(promptText, errId)
                            }
                            onRestorePrompt={handleRestorePrompt}
                        />
                    )}
                    contentContainerStyle={[
                        styles.messagesListContent,
                        messages.length === 0 && styles.emptyListContent,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={scrollToBottom}
                    ListEmptyComponent={
                        <AiChatPromptSuggestions
                            variant="empty"
                            clientContext={clientContext}
                            disabled={loading}
                            onSelectPrompt={(promptText) => sendMessage(promptText)}
                        />
                    }
                />

                {/* 3. Pílulas Horizontais de Sugestões de Prompts (acima do Composer, igual ao template) */}
                <AiChatPromptSuggestions
                    variant="pills"
                    clientContext={clientContext}
                    disabled={loading}
                    onSelectPrompt={(promptText) => sendMessage(promptText)}
                />

                {/* 4. Card Flutuante de Mensagem com Halo Luminoso */}
                <AiChatComposer
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={() => sendMessage()}
                    loading={loading}
                    clientContext={clientContext}
                    onClearClientContext={() => setClientContext(null)}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    circleHeaderBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            },
        }),
    },
    centerBrandMark: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.85,
    },
    btnDisabled: {
        opacity: 0.45,
    },
    keyboardContainer: {
        flex: 1,
    },
    messagesListContent: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 16,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});
