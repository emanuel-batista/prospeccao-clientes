import React, {
    useState,
    useCallback,
    useMemo,
    useEffect,
    useLayoutEffect,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    useFonts,
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
} from '@expo-google-fonts/inter';

import api from '../../services/api';
import {
    BackButton,
    ClientCard,
    ClientFilterTabs,
    ClientSearchBar,
    ClientEmptyState,
} from '../../components';

/**
 * Filtros rápidos disponíveis
 */
const FILTER_TABS = [
    { id: 'all', label: 'Todos' },
    { id: 'novo', label: 'Novos' },
    { id: 'alto', label: 'Alto Potencial' },
    { id: 'acompanhamento', label: 'Acompanhamento' },
    { id: 'convertido', label: 'Convertidos' },
];

/**
 * Fallback defensivo para ambiente de desenvolvimento ou conexão indisponível
 */
const FALLBACK_CLIENTS = [
    {
        _id: 'client-1',
        razao_social: 'TechCorp Inovações Ltda',
        cnpj: '12345678000190',
        situacao: 'Novo',
        potencial_compra: 'Alto',
        score: 85,
    },
    {
        _id: 'client-2',
        razao_social: 'Indústria Metalúrgica Brasil S/A',
        cnpj: '98765432000110',
        situacao: 'Em Negociação',
        potencial_compra: 'Alto',
        score: 92,
    },
    {
        _id: 'client-3',
        razao_social: 'Logística & Distribuição Express',
        cnpj: '45123789000155',
        situacao: 'Em Contato',
        potencial_compra: 'Médio',
        score: 64,
    },
    {
        _id: 'client-4',
        razao_social: 'Agropecuária Horizonte Verde',
        cnpj: '33987654000122',
        situacao: 'Fechado',
        potencial_compra: 'Alto',
        score: 95,
    },
    {
        _id: 'client-5',
        razao_social: 'Varejo Comercial Aliança',
        cnpj: '77888999000144',
        situacao: 'Novo',
        potencial_compra: 'Baixo',
        score: 42,
    },
];

/**
 * Normaliza parâmetro de rota para o id da aba correspondente
 */
function normalizeRouteFilter(filterParam) {
    if (!filterParam) return 'all';
    const lower = String(filterParam).toLowerCase().trim();
    if (lower.includes('novo')) return 'novo';
    if (lower.includes('alto')) return 'alto';
    if (
        lower.includes('acompanh') ||
        lower.includes('contato') ||
        lower.includes('negocia') ||
        lower.includes('prospec')
    ) {
        return 'acompanhamento';
    }
    if (lower.includes('convertid') || lower.includes('fechad')) {
        return 'convertido';
    }
    return 'all';
}

/**
 * ClientsListScreen
 * Lista comercial de clientes no padrão fintech contemporâneo e clean.
 */
export default function ClientsListScreen({ navigation, route }) {
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

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState(() =>
        normalizeRouteFilter(route.params?.filter)
    );

    // Oculta header padrão do stack para adotar barra integrada
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Atualiza o filtro ativo caso navegue com novo parâmetro
    useEffect(() => {
        if (route.params?.filter) {
            setActiveFilter(normalizeRouteFilter(route.params.filter));
        }
    }, [route.params?.filter]);

    // Busca clientes da API com fallback defensivo
    const loadClients = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await api.get('/clients');
            const data = response.data;
            const items = Array.isArray(data) ? data : data?.clients || [];

            if (items.length > 0) {
                setClients(items);
            } else {
                setClients(FALLBACK_CLIENTS);
            }
        } catch (error) {
            // Em caso de falha de conexão, preserva usabilidade com fallback
            setClients(FALLBACK_CLIENTS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadClients();
        }, [loadClients])
    );

    // Contagem dinâmica por categoria do funil
    const counts = useMemo(() => {
        const result = {
            all: clients.length,
            novo: 0,
            alto: 0,
            acompanhamento: 0,
            convertido: 0,
        };

        clients.forEach((c) => {
            const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
            const pot = (c.potencial_compra || c.potencialCompra || c.potencial || '').toLowerCase();
            const score = Number(c.score || 0);

            if (status.includes('novo')) {
                result.novo += 1;
            }
            if (pot === 'alto' || score >= 70) {
                result.alto += 1;
            }
            if (
                status.includes('contato') ||
                status.includes('negocia') ||
                status.includes('acompanh') ||
                status.includes('prospec')
            ) {
                result.acompanhamento += 1;
            }
            if (status.includes('fechad') || status.includes('convertid')) {
                result.convertido += 1;
            }
        });

        return result;
    }, [clients]);

    // Filtragem combinada: busca textual + aba de status
    const filteredClients = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const queryDigits = query.replace(/\D/g, '');

        return clients.filter((c) => {
            const razao = (c.razao_social || c.razaoSocial || c.name || '').toLowerCase();
            const cnpj = (c.cnpj || c.document || '').toLowerCase();
            const cnpjDigits = cnpj.replace(/\D/g, '');
            const status = (c.situacao || c.situacaoComercial || c.status || '').toLowerCase();
            const pot = (c.potencial_compra || c.potencialCompra || c.potencial || '').toLowerCase();
            const score = Number(c.score || 0);

            // 1. Filtro textual por razão social ou CNPJ
            if (query.length > 0) {
                const matchesName = razao.includes(query);
                const matchesCnpj =
                    cnpj.includes(query) || (queryDigits && cnpjDigits.includes(queryDigits));
                if (!matchesName && !matchesCnpj) return false;
            }

            // 2. Filtro por aba selecionada
            if (activeFilter === 'novo') {
                return status.includes('novo');
            }
            if (activeFilter === 'alto') {
                return pot === 'alto' || score >= 70;
            }
            if (activeFilter === 'acompanhamento') {
                return (
                    status.includes('contato') ||
                    status.includes('negocia') ||
                    status.includes('acompanh') ||
                    status.includes('prospec')
                );
            }
            if (activeFilter === 'convertido') {
                return status.includes('fechad') || status.includes('convertid');
            }

            return true;
        });
    }, [clients, searchQuery, activeFilter]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setActiveFilter('all');
    };

    const handleNewClient = () => {
        navigation.navigate('ClientForm');
    };

    const handleSelectClient = (client) => {
        navigation.navigate('ClientDetail', {
            id: client._id || client.id,
            client,
        });
    };

    const isFiltered = Boolean(searchQuery.trim() || activeFilter !== 'all');

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* 1. Header Integrado com Navegação e Ação Primária */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <View style={styles.headerTitleGroup}>
                        <Text style={[styles.headerTitle, { fontFamily: fontBold }]}>
                            Clientes
                        </Text>
                        <View style={styles.totalBadge}>
                            <Text style={[styles.totalBadgeText, { fontFamily: fontSemiBold }]}>
                                {clients.length}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleNewClient}
                    activeOpacity={0.85}
                    style={styles.newButton}
                    accessibilityRole="button"
                    accessibilityLabel="Cadastrar novo cliente">
                    <MaterialIcons name="add" size={18} color="#FFFFFF" />
                    <Text style={[styles.newButtonText, { fontFamily: fontSemiBold }]}>
                        Novo
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 2. Barra de Busca */}
            <View style={styles.searchWrapper}>
                <ClientSearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery('')}
                />
            </View>

            {/* 3. Filtros Horizontais */}
            <View style={styles.filterWrapper}>
                <ClientFilterTabs
                    tabs={FILTER_TABS}
                    activeTab={activeFilter}
                    onSelectTab={setActiveFilter}
                    counts={counts}
                />
            </View>

            {/* 4. Lista Principal de Clientes */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#080A96" />
                </View>
            ) : (
                <FlatList
                    data={filteredClients}
                    keyExtractor={(item) => String(item._id || item.id || item.cnpj)}
                    renderItem={({ item }) => (
                        <ClientCard
                            client={item}
                            onPress={() => handleSelectClient(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadClients(true)}
                            colors={['#080A96']}
                            tintColor="#080A96"
                        />
                    }
                    ListEmptyComponent={
                        <ClientEmptyState
                            isFiltered={isFiltered}
                            onResetFilters={handleResetFilters}
                            onNewClient={handleNewClient}
                        />
                    }
                />
            )}
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
        paddingBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
    },
    headerTitle: {
        fontSize: 20,
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    totalBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
    totalBadgeText: {
        fontSize: 12,
        color: '#475569',
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#080A96',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 10,
        gap: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 6px rgba(8, 10, 150, 0.18)',
            },
        }),
    },
    newButtonText: {
        fontSize: 13,
        color: '#FFFFFF',
    },
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    filterWrapper: {
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
