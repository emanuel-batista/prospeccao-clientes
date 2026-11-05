import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    useFonts,
    Inter_700Bold,
    Inter_500Medium,
    Inter_400Regular,
} from '@expo-google-fonts/inter';

import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { WelcomeBar, MetricCard, QuickActionBar } from '../../components';

/**
 * DashboardScreen (Sway Finance / Modern Fintech Light Theme)
 * 
 * Inspirado nas melhores práticas de design financeiro contemporâneo (Phenomenon Studio):
 * 1. Tema claro limpo, arejado e de alto contraste (#F8FAFC).
 * 2. Card Hero em destaque institucional (#080A96) para a métrica Total.
 * 3. Atalhos rápidos com relevo Neumórfico tátil sutil (Novo Cliente, Lista, Assistente IA).
 * 4. Grade modular 2x2 com os 4 indicadores do funil (Novos, Alto Potencial, Acompanhamento, Convertidos).
 */
export default function DashboardScreen({ navigation }) {
    const { user, logout } = useAuth();

    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_500Medium,
        Inter_400Regular,
    });

    const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded ? 'Inter_500Medium' : Platform.select({ ios: 'System', android: 'sans-serif' });
    const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.select({ ios: 'System', android: 'sans-serif' });

    // Estado dos 5 indicadores do escopo
    const [metrics, setMetrics] = useState({
        total: 0,
        novos: 0,
        altoPotencial: 0,
        acompanhamento: 0,
        convertidos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Oculta header padrão para renderizar a WelcomeBar no topo
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Busca de indicadores com tratamento defensivo e fallback
    const loadDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        let connectionSuccess = false;

        try {
            const response = await api.get('/dashboard');
            const data = response.data;

            if (data) {
                setMetrics({
                    total: data.total ?? data.totalClients ?? 0,
                    novos: data.novos ?? data.newClients ?? 0,
                    altoPotencial: data.altoPotencial ?? data.highPotential ?? 0,
                    acompanhamento: data.acompanhamento ?? data.followUp ?? 0,
                    convertidos: data.convertidos ?? data.converted ?? 0,
                });
                connectionSuccess = true;
            }
        } catch (dashboardError) {
            try {
                const clientsRes = await api.get('/clients');
                const clients = Array.isArray(clientsRes.data)
                    ? clientsRes.data
                    : clientsRes.data?.clients || [];

                const total = clients.length;

                const novos = clients.filter((c) => {
                    const status = (c.situacaoComercial || c.status || '').toLowerCase();
                    return status === 'novo';
                }).length;

                const altoPotencial = clients.filter((c) => {
                    const pot = (c.potencialCompra || c.potencial || '').toLowerCase();
                    const score = Number(c.score || 0);
                    return pot === 'alto' || score >= 70;
                }).length;

                const acompanhamento = clients.filter((c) => {
                    const status = (c.situacaoComercial || c.status || '').toLowerCase();
                    return (
                        status.includes('prospec') ||
                        status.includes('negocia') ||
                        status.includes('acompanh')
                    );
                }).length;

                const convertidos = clients.filter((c) => {
                    const status = (c.situacaoComercial || c.status || '').toLowerCase();
                    return status.includes('convertid');
                }).length;

                setMetrics({
                    total,
                    novos,
                    altoPotencial,
                    acompanhamento,
                    convertidos,
                });
                connectionSuccess = true;
            } catch (fallbackError) {
                connectionSuccess = false;
            }
        } finally {
            setIsOffline(!connectionSuccess);
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [loadDashboardData])
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadDashboardData(true)}
                        colors={['#080A96']}
                        tintColor="#080A96"
                    />
                }>
                
                {/* 1. Barra de Boas-Vindas com Logout */}
                <WelcomeBar user={user} onLogout={logout} isOffline={isOffline} />

                {/* Banner Informativo Offline (se backend inacessível) */}
                {isOffline && (
                    <View style={styles.offlineBanner}>
                        <MaterialIcons name="cloud-off" size={16} color="#D97706" style={styles.offlineIcon} />
                        <Text style={[styles.offlineText, { fontFamily: fontMedium }]}>
                            Servidor indisponível no momento. Exibindo dados locais seguros.
                        </Text>
                    </View>
                )}

                {/* 2. Hero Card: Indicador 1 (Total de Clientes) com Glassmorphism */}
                <MetricCard
                    variant="hero"
                    title="Total de Clientes"
                    value={metrics.total}
                    icon="business"
                    accentColor="#080A96"
                    subtitle="Empresas cadastradas sob sua gestão comercial"
                    loading={loading && !refreshing}
                    onPress={() => navigation.navigate('ClientsList')}
                />

                {/* 3. Atalhos Rápidos com Neumorfismo Tátil Sutil */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { fontFamily: fontBold }]}>
                        Ações Rápidas
                    </Text>
                </View>

                <QuickActionBar
                    onNewClient={() => navigation.navigate('ClientForm')}
                    onClientList={() => navigation.navigate('ClientsList')}
                    onAiAssistant={() => navigation.navigate('AiChat')}
                />

                {/* 4. Indicadores Comerciais (Grade 2x2 com os 4 indicadores restantes) */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { fontFamily: fontBold }]}>
                        Funil de Oportunidades
                    </Text>
                    <Text style={[styles.sectionSubtitle, { fontFamily: fontRegular }]}>
                        Status atual das negociações em andamento
                    </Text>
                </View>

                {/* Linha 1: Novos Clientes & Alto Potencial */}
                <View style={styles.gridRow}>
                    <MetricCard
                        title="Novos Clientes"
                        value={metrics.novos}
                        icon="person-add-alt-1"
                        accentColor="#0284C7"
                        subtitle="Aguardando contato"
                        loading={loading && !refreshing}
                        onPress={() => navigation.navigate('ClientsList', { filter: 'Novo' })}
                    />
                    <View style={styles.gridGap} />
                    <MetricCard
                        title="Alto Potencial"
                        value={metrics.altoPotencial}
                        icon="trending-up"
                        accentColor="#D97706"
                        subtitle="Score comercial alto"
                        loading={loading && !refreshing}
                        onPress={() => navigation.navigate('ClientsList', { filter: 'Alto' })}
                    />
                </View>

                {/* Linha 2: Acompanhamento & Convertidos */}
                <View style={styles.gridRow}>
                    <MetricCard
                        title="Acompanhamento"
                        value={metrics.acompanhamento}
                        icon="schedule"
                        accentColor="#7C3AED"
                        subtitle="Em negociação ativa"
                        loading={loading && !refreshing}
                        onPress={() => navigation.navigate('ClientsList', { filter: 'Acompanhamento' })}
                    />
                    <View style={styles.gridGap} />
                    <MetricCard
                        title="Convertidos"
                        value={metrics.convertidos}
                        icon="verified"
                        accentColor="#059669"
                        subtitle="Vendas concluídas"
                        loading={loading && !refreshing}
                        onPress={() => navigation.navigate('ClientsList', { filter: 'Convertido' })}
                    />
                </View>

                {/* Rodapé Informativo Clean */}
                <View style={styles.footerNote}>
                    <Text style={[styles.footerText, { fontFamily: fontMedium }]}>
                        Made by: Emanuel Silva, Mariana Barbosa, Otávio Chile e Paulo Martins | © 2026
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 36,
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 9,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    offlineIcon: {
        marginRight: 8,
    },
    offlineText: {
        fontSize: 12,
        color: '#92400E',
        flex: 1,
    },
    sectionHeader: {
        marginBottom: 12,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    gridRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    gridGap: {
        width: 12,
    },
    footerNote: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        paddingVertical: 6,
    },
    footerText: {
        fontSize: 11,
        color: '#94A3B8',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
});
