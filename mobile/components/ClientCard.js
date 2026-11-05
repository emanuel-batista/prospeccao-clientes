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

/**
 * Utilitário de formatação de CNPJ
 */
function formatCnpj(raw) {
    if (!raw) return 'CNPJ não informado';
    const digits = String(raw).replace(/\D/g, '');
    if (digits.length === 14) {
        return digits.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5'
        );
    }
    return raw;
}

/**
 * Obter configuração semântica de status/situação
 */
function getStatusConfig(situacao) {
    const s = String(situacao || '').toLowerCase();

    if (s.includes('novo')) {
        return {
            label: 'Novo',
            color: '#0284C7',
            backgroundColor: '#E0F2FE',
        };
    }
    if (s.includes('contato') || s.includes('negocia') || s.includes('acompanh') || s.includes('prospec')) {
        return {
            label: situacao || 'Em Contato',
            color: '#7C3AED',
            backgroundColor: '#F3E8FF',
        };
    }
    if (s.includes('fechad') || s.includes('convertid')) {
        return {
            label: 'Convertido',
            color: '#059669',
            backgroundColor: '#DCFCE7',
        };
    }
    if (s.includes('perdid')) {
        return {
            label: 'Perdido',
            color: '#DC2626',
            backgroundColor: '#FEE2E2',
        };
    }

    return {
        label: situacao || 'Indefinido',
        color: '#475569',
        backgroundColor: '#F1F5F9',
    };
}

/**
 * Obter cor do potencial comercial
 */
function getPotentialColor(potencial, score) {
    const pot = String(potencial || '').toLowerCase();
    const numScore = Number(score || 0);

    if (pot === 'alto' || numScore >= 70) {
        return '#D97706';
    }
    if (pot === 'médio' || pot === 'medio' || (numScore >= 40 && numScore < 70)) {
        return '#0284C7';
    }
    return '#64748B';
}

/**
 * ClientCard
 * Card minimalista e clean para apresentação de oportunidades na lista de clientes.
 */
export default function ClientCard({ client, onPress, style }) {
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

    if (!client) return null;

    const razaoSocial = client.razao_social || client.razaoSocial || client.name || 'Empresa sem nome';
    const cnpj = client.cnpj || client.document || '';
    const situacao = client.situacao || client.situacaoComercial || client.status || 'Novo';
    const potencial = client.potencial_compra || client.potencialCompra || client.potencial || 'Médio';
    const score = client.score !== undefined ? Number(client.score) : null;

    const statusConfig = getStatusConfig(situacao);
    const potColor = getPotentialColor(potencial, score);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.card, style]}
            accessibilityRole="button"
            accessibilityLabel={`Cliente ${razaoSocial}`}>
            {/* Linha Principal: Identificação da Empresa e Status */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <Text
                        style={[styles.companyName, { fontFamily: fontSemiBold }]}
                        numberOfLines={1}>
                        {razaoSocial}
                    </Text>
                    <Text style={[styles.cnpjText, { fontFamily: fontRegular }]}>
                        {formatCnpj(cnpj)}
                    </Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.backgroundColor },
                    ]}>
                    <Text
                        style={[
                            styles.statusText,
                            { color: statusConfig.color, fontFamily: fontMedium },
                        ]}
                        numberOfLines={1}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Divisor Sutil */}
            <View style={styles.divider} />

            {/* Linha Inferior: Indicador de Potencial, Score e Ação */}
            <View style={styles.footerRow}>
                <View style={styles.metaGroup}>
                    <View style={[styles.indicatorDot, { backgroundColor: potColor }]} />
                    <Text style={[styles.potencialText, { fontFamily: fontMedium }]}>
                        Potencial {potencial}
                    </Text>
                    {score !== null && !isNaN(score) && (
                        <Text style={[styles.scoreText, { fontFamily: fontRegular }]}>
                            Score: {score}
                        </Text>
                    )}
                </View>

                <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
            },
            android: {
                elevation: 1.5,
            },
            web: {
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
            },
        }),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    titleContainer: {
        flex: 1,
    },
    companyName: {
        fontSize: 15,
        color: '#0F172A',
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    cnpjText: {
        fontSize: 12,
        color: '#64748B',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 11,
        letterSpacing: 0.1,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metaGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    indicatorDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 6,
    },
    potencialText: {
        fontSize: 12,
        color: '#334155',
        marginRight: 10,
    },
    scoreText: {
        fontSize: 12,
        color: '#64748B',
    },
});

