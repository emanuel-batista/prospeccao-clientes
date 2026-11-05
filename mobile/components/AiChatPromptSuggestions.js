import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
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
 * Sugestões de prompts comerciais alinhadas às ferramentas da IA
 */
const DEFAULT_SUGGESTIONS = [
    {
        id: 'prioritize',
        icon: 'trending-up',
        color: '#7C3AED',
        label: 'Priorizar carteira',
        prompt: 'Analise minha carteira e recomende quais oportunidades ativas devo priorizar hoje.',
    },
    {
        id: 'high_potential',
        icon: 'local-fire-department',
        color: '#D97706',
        label: 'Alto potencial',
        prompt: 'Liste meus clientes com potencial de compra Alto e destaque seus scores.',
    },
    {
        id: 'new_leads',
        icon: 'auto-awesome',
        color: '#0284C7',
        label: 'Novos clientes',
        prompt: 'Quais clientes estão com situação Novo aguardando primeiro contato?',
    },
    {
        id: 'negotiation',
        icon: 'handshake',
        color: '#059669',
        label: 'Em negociação',
        prompt: 'Liste os clientes em negociação ou em contato e sugira argumentos comerciais.',
    },
];

/**
 * AiChatPromptSuggestions
 * - variant="empty": Exibe o visual futurístico central com título minimalista e a Esfera 3D (AiOrb).
 * - variant="pills": Exibe a barra horizontal de pílulas de sugestões logo acima do campo de mensagem.
 */
export default function AiChatPromptSuggestions({
    onSelectPrompt,
    clientContext,
    disabled = false,
    variant = 'empty', // 'empty' | 'pills'
}) {
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

    const clientName =
        clientContext?.razao_social ||
        clientContext?.razaoSocial ||
        clientContext?.nomeFantasia ||
        clientContext?.name ||
        null;

    const contextualPrompts = clientName
        ? [
              {
                  id: 'ctx_analyze',
                  icon: 'auto-awesome',
                  color: '#7C3AED',
                  label: `Analisar ${clientName.split(' ')[0]}`,
                  prompt: `Consulte os dados do cliente "${clientName}" e recomende a melhor estratégia comercial considerando seu estágio atual e score.`,
              },
              {
                  id: 'ctx_pitch',
                  icon: 'record-voice-over',
                  color: '#080A96',
                  label: 'Roteiro de abordagem',
                  prompt: `Crie um roteiro curto e persuasivo de abordagem comercial para o cliente "${clientName}".`,
              },
          ]
        : [];

    const allSuggestions = [...contextualPrompts, ...DEFAULT_SUGGESTIONS];

    // Barra horizontal de pílulas flutuantes (posicionada acima do composer, igual ao template)
    if (variant === 'pills') {
        return (
            <View style={styles.pillsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.pillsScroll}>
                    {allSuggestions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.pillButton, disabled && styles.pillDisabled]}
                            onPress={() => onSelectPrompt(item.prompt)}
                            disabled={disabled}
                            activeOpacity={0.78}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}>
                            <MaterialIcons name={item.icon} size={15} color={item.color} />
                            <Text style={[styles.pillText, { fontFamily: fontMedium }]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // Estado Inicial Futurístico (Zero-State centralizado com a Esfera 3D Iridescente)
    return (
        <View style={styles.heroContainer}>
            <Text style={[styles.heroHeadline, { fontFamily: fontSemiBold }]}>
                <Text style={[styles.heroHighlight, { fontFamily: fontBold }]}>
                    IA{' '}
                </Text>
                para Prospecção Fluida{'\n'}& Análise de Carteira
            </Text>

            {clientName ? (
                <Text
                    style={[styles.clientSubtitle, { fontFamily: fontRegular }]}
                    numberOfLines={1}>
                    Foco ativo em{' '}
                    <Text style={{ fontFamily: fontSemiBold, color: '#080A96' }}>
                        {clientName}
                    </Text>
                </Text>
            ) : null}

            <View style={styles.orbStage}>
                <AiOrb size={184} showReflection animated />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    heroHeadline: {
        fontSize: 22,
        lineHeight: 30,
        color: '#0F172A',
        textAlign: 'center',
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    heroHighlight: {
        color: '#7C3AED',
    },
    clientSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 8,
    },
    orbStage: {
        marginTop: 18,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Pílulas horizontais acima do Composer (estilo do template)
    pillsContainer: {
        paddingBottom: 10,
        paddingTop: 4,
    },
    pillsScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    pillButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EEF2FF',
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
            },
            android: {
                elevation: 1,
            },
            web: {
                boxShadow: '0 2px 8px rgba(8, 10, 150, 0.04)',
            },
        }),
    },
    pillText: {
        fontSize: 12,
        color: '#1E293B',
        letterSpacing: -0.1,
    },
    pillDisabled: {
        opacity: 0.5,
    },
});
