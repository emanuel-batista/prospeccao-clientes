import React, {
    useState,
    useEffect,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Linking,
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
    Button,
    ClientErrorState,
    formatCnpj,
    getStatusConfig,
    getPotentialColor,
    formatCnpjInput,
} from '../../components';

/**
 * Retorna mensagem de temperatura e recomendação comercial baseada no Score
 */
function getScoreDiagnosis(score) {
    const s = Number(score || 0);
    if (s >= 80) {
        return {
            temperature: 'Quente',
            color: '#D97706',
            bgColor: '#FEF3C7',
            icon: 'local-fire-department',
            tip: 'Oportunidade de alta prioridade. Ideal para fechamento imediato.',
        };
    }
    if (s >= 60) {
        return {
            temperature: 'Aquecida',
            color: '#D97706',
            bgColor: '#FEF3C7',
            icon: 'whatshot',
            tip: 'Lead em maturação avançada. Agende demonstração ou envie proposta.',
        };
    }
    if (s >= 40) {
        return {
            temperature: 'Morna',
            color: '#0284C7',
            bgColor: '#E0F2FE',
            icon: 'trending-up',
            tip: 'Oportunidade em estágio inicial. Necessita de qualificação ativa.',
        };
    }
    return {
        temperature: 'Fria',
        color: '#64748B',
        bgColor: '#F1F5F9',
        icon: 'ac-unit',
        tip: 'Lead frio ou recém-descoberto. Inicie primeiro contato de sondagem.',
    };
}

/**
 * Formata data no padrão brasileiro
 */
function formatDate(isoString) {
    if (!isoString) return null;
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return null;

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch {
        return null;
    }
}

/**
 * ClientDetailScreen
 * Tela de detalhes comerciais da oportunidade / cliente.
 * Alinhada aos princípios de design contemporâneo (clean fintech, layout aberto,
 * sem cartões aninhados "AI slop", tipografia Inter e diagnóstico de conexão Nielsen #9).
 */
export default function ClientDetailScreen({ navigation, route }) {
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

    const routeClient = route.params?.client || null;
    const clientId = route.params?.id || routeClient?._id || routeClient?.id || null;

    const [client, setClient] = useState(routeClient);
    const [enrichedData, setEnrichedData] = useState(null);
    const [loading, setLoading] = useState(Boolean(!routeClient && clientId));
    const [refreshing, setRefreshing] = useState(false);
    const [loadingEnriched, setLoadingEnriched] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Guardas com useRef para garantir estritamente 1 requisição única
    const enrichedLoadedCnpjRef = useRef('');
    const isFetchingEnrichedRef = useRef(false);
    const clientRef = useRef(client);
    clientRef.current = client;

    // Oculta header padrão do Stack para adotar cabeçalho integrado
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    // Busca dados enriquecidos na Receita Federal via BrasilAPI (/integrations/cnpj/:cnpj)
    // Garante que é executado apenas 1x por CNPJ
    const loadEnrichedData = useCallback(async (cnpjValue, force = false) => {
        const digits = String(cnpjValue || '').replace(/\D/g, '');
        if (digits.length !== 14) return;

        // Se já buscou este CNPJ e não for atualização manual forçada, ignora
        if (!force && enrichedLoadedCnpjRef.current === digits) {
            return;
        }
        if (isFetchingEnrichedRef.current) {
            return;
        }

        isFetchingEnrichedRef.current = true;
        enrichedLoadedCnpjRef.current = digits;
        setLoadingEnriched(true);

        try {
            const res = await api.get(`/integrations/cnpj/${digits}`);
            if (res.data && (res.data.razaoSocial || res.data.razao_social || res.data.nomeFantasia)) {
                setEnrichedData(res.data);
            }
        } catch {
            // Falha não-bloqueante: preserva os dados cadastrais primários e não faz loop
        } finally {
            isFetchingEnrichedRef.current = false;
            setLoadingEnriched(false);
        }
    }, []);

    // Carrega dados completos do cliente no backend (/clients/:id)
    // Totalmente estável: não tem 'client' nas dependências para não disparar render loop
    const loadClientDetails = useCallback(
        async (isRefresh = false) => {
            if (!clientId) {
                setLoading(false);
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            } else if (!clientRef.current) {
                setLoading(true);
            }

            try {
                const response = await api.get(`/clients/${clientId}`);
                const data = response.data;

                if (data) {
                    setClient(data);
                    setConnectionError(null);

                    // Busca dados adicionais da Receita Federal apenas 1x
                    const currentCnpj = data.cnpj || data.document;
                    if (currentCnpj) {
                        loadEnrichedData(currentCnpj, isRefresh);
                    }
                }
            } catch (err) {
                const isConn =
                    !err.response ||
                    err.code === 'ECONNABORTED' ||
                    err.code === 'ERR_NETWORK' ||
                    (typeof err.message === 'string' &&
                        (err.message.toLowerCase().includes('network') ||
                            err.message.toLowerCase().includes('timeout') ||
                            err.message.toLowerCase().includes('connect'))) ||
                    (err.response && err.response.status >= 500);

                setConnectionError({
                    isConnection: isConn,
                    title: isConn
                        ? 'Sem conexão com o servidor'
                        : 'Cliente não localizado',
                    message: isConn
                        ? 'Não foi possível sincronizar os dados mais recentes deste cliente.'
                        : 'Este cliente pode ter sido removido ou não está mais disponível.',
                });
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [clientId, loadEnrichedData]
    );

    // Carrega dados apenas 1x ao focar na tela
    useFocusEffect(
        useCallback(() => {
            loadClientDetails(false);
        }, [loadClientDetails])
    );

    // Navega para edição
    const handleEdit = () => {
        navigation.navigate('ClientForm', {
            id: clientId,
            client,
        });
    };

    // Confirmação e exclusão segura (Heurística de Nielsen #5 - Prevenção de Erros)
    const handleDelete = () => {
        const companyName =
            client?.razao_social ||
            client?.razaoSocial ||
            client?.name ||
            'este cliente';

        const msg = `Tem certeza que deseja excluir "${companyName}"? O histórico e métricas associadas serão removidos.`;

        const doDelete = async () => {
            setDeleting(true);
            try {
                await api.delete(`/clients/${clientId}`);
                navigation.goBack();
            } catch (err) {
                const errorMsg =
                    err.response?.data?.erro ||
                    err.response?.data?.message ||
                    'Não foi possível excluir o cliente.';
                Alert.alert('Erro ao excluir', errorMsg);
                setDeleting(false);
            }
        };

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm(msg)) {
                doDelete();
            }
        } else {
            Alert.alert('Excluir Cliente', msg, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    // Abre Assistente IA com o contexto deste cliente
    const handleAskAi = () => {
        navigation.navigate('AiChat', {
            client,
            initialPrompt: `Analise as oportunidades e recomende a melhor abordagem para o cliente ${
                client?.razao_social || client?.razaoSocial || 'selecionado'
            }, considerando seu estágio atual (${client?.situacao || 'Novo'}) e score (${client?.score || 0}).`,
        });
    };

    // Ações de contato
    const handleCall = (phoneNumber) => {
        const cleaned = String(phoneNumber || '').replace(/\D/g, '');
        if (!cleaned) return;
        Linking.openURL(`tel:${cleaned}`).catch(() => {
            Alert.alert('Aviso', 'Não foi possível discar para este número.');
        });
    };

    const handleEmail = (emailAddress) => {
        if (!emailAddress) return;
        Linking.openURL(`mailto:${emailAddress}`).catch(() => {
            Alert.alert('Aviso', 'Não foi possível abrir o cliente de e-mail.');
        });
    };

    const handleOpenMap = (addressText) => {
        if (!addressText) return;
        const encoded = encodeURIComponent(addressText);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`).catch(() => {
            Alert.alert('Aviso', 'Não foi possível abrir o mapa.');
        });
    };

    // Dados derivados para renderização
    const razaoSocial =
        client?.razao_social ||
        client?.razaoSocial ||
        client?.name ||
        'Empresa sem razão social';

    const cnpjRaw = client?.cnpj || client?.document || '';
    const formattedCnpj = formatCnpj(cnpjRaw);

    const situacao =
        client?.situacao || client?.situacaoComercial || client?.status || 'Novo';
    const statusCfg = getStatusConfig(situacao);

    const potencial =
        client?.potencial_compra ||
        client?.potencialCompra ||
        client?.potencial ||
        'Médio';

    const scoreValue = Math.max(
        0,
        Math.min(100, client?.score !== undefined ? Number(client.score) : 50)
    );
    const scoreDiag = getScoreDiagnosis(scoreValue);
    const potColor = getPotentialColor(potencial, scoreValue);

    const nomeFantasia =
        enrichedData?.nomeFantasia || client?.nomeFantasia || client?.fantasia || null;
    const situacaoCadastral = enrichedData?.situacaoCadastral || null;
    const cnae = enrichedData?.atividadePrincipal || null;
    const telefone = enrichedData?.telefone || null;
    const email = enrichedData?.email || null;

    // Constrói string de endereço se disponível
    const fullAddress = useMemo(() => {
        if (!enrichedData) return null;
        const parts = [
            enrichedData.rua
                ? `${enrichedData.rua}${enrichedData.numero ? `, ${enrichedData.numero}` : ''}`
                : null,
            enrichedData.complemento || null,
            enrichedData.bairro || null,
            enrichedData.cidade && enrichedData.estado
                ? `${enrichedData.cidade} - ${enrichedData.estado}`
                : enrichedData.cidade || enrichedData.estado || null,
            enrichedData.cep ? `CEP ${enrichedData.cep}` : null,
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : null;
    }, [enrichedData]);

    const createdFormatted = formatDate(client?.createdAt);
    const updatedFormatted = formatDate(client?.updatedAt);

    // Estado 1: Carregamento inicial por ID
    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <Text style={[styles.headerTitle, { fontFamily: fontBold }]}>
                        Detalhes do Cliente
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#080A96" />
                    <Text style={[styles.loadingText, { fontFamily: fontMedium }]}>
                        Carregando informações da oportunidade...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Estado 2: Erro definitivo e sem dados locais (Nielsen #9)
    if (connectionError && !client) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <StatusBar style="dark" />
                <View style={styles.header}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <Text style={[styles.headerTitle, { fontFamily: fontBold }]}>
                        Detalhes do Cliente
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>
                <ScrollView
                    contentContainerStyle={styles.centerContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadClientDetails(true)}
                            colors={['#080A96']}
                            tintColor="#080A96"
                        />
                    }>
                    <ClientErrorState
                        title={connectionError.title}
                        message={connectionError.message}
                        onRetry={() => loadClientDetails(false)}
                    />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* 1. Header Integrado com Ações Contextuais */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <Text style={[styles.headerTitle, { fontFamily: fontBold }]}>
                        Detalhes do Cliente
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleEdit}
                        style={styles.headerIconButton}
                        activeOpacity={0.7}
                        disabled={deleting}
                        accessibilityRole="button"
                        accessibilityLabel="Editar cliente">
                        <MaterialIcons name="edit" size={20} color="#080A96" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDelete}
                        style={styles.headerIconButton}
                        activeOpacity={0.7}
                        disabled={deleting}
                        accessibilityRole="button"
                        accessibilityLabel="Excluir cliente">
                        <MaterialIcons name="delete-outline" size={21} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Banner de Sincronização Indisponível (quando exibe dados locais) */}
            {connectionError && client && (
                <View style={styles.offlineBanner}>
                    <MaterialIcons
                        name="cloud-off"
                        size={16}
                        color="#DC2626"
                        style={styles.bannerIcon}
                    />
                    <Text style={[styles.offlineBannerText, { fontFamily: fontMedium }]}>
                        {connectionError.message}
                    </Text>
                    <TouchableOpacity
                        onPress={() => loadClientDetails(true)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={[styles.retryBannerText, { fontFamily: fontSemiBold }]}>
                            Tentar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadClientDetails(true)}
                        colors={['#080A96']}
                        tintColor="#080A96"
                    />
                }>
                {/* 2. Hero: Identificação da Empresa (Layout aberto, sem cards aninhados) */}
                <View style={styles.heroSection}>
                    <View style={styles.heroTopRow}>
                        <View style={styles.companyAvatar}>
                            <MaterialIcons name="business" size={26} color="#080A96" />
                        </View>
                        <View style={styles.heroTitles}>
                            <Text
                                style={[styles.companyName, { fontFamily: fontBold }]}
                                selectable>
                                {razaoSocial}
                            </Text>
                            {nomeFantasia ? (
                                <Text style={[styles.fantasyName, { fontFamily: fontRegular }]}>
                                    {nomeFantasia}
                                </Text>
                            ) : null}
                            <View style={styles.cnpjRow}>
                                <MaterialIcons name="badge" size={14} color="#64748B" />
                                <Text
                                    style={[styles.cnpjText, { fontFamily: fontMedium }]}
                                    selectable>
                                    {formattedCnpj}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Linha de Badges Rápidos: Estágio, Potencial e Score */}
                    <View style={styles.badgesRow}>
                        {/* Status no Funil */}
                        <View
                            style={[
                                styles.badgePill,
                                { backgroundColor: statusCfg.backgroundColor },
                            ]}>
                            <View
                                style={[
                                    styles.badgeDot,
                                    { backgroundColor: statusCfg.color },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.badgeLabel,
                                    { color: statusCfg.color, fontFamily: fontSemiBold },
                                ]}>
                                {statusCfg.label}
                            </Text>
                        </View>

                        {/* Potencial Comercial */}
                        <View
                            style={[
                                styles.badgePill,
                                { backgroundColor: `${potColor}18` },
                            ]}>
                            <MaterialIcons
                                name="local-fire-department"
                                size={14}
                                color={potColor}
                                style={styles.pillIcon}
                            />
                            <Text
                                style={[
                                    styles.badgeLabel,
                                    { color: potColor, fontFamily: fontSemiBold },
                                ]}>
                                Potencial {potencial}
                            </Text>
                        </View>

                        {/* Score / Temperatura */}
                        <View
                            style={[
                                styles.badgePill,
                                { backgroundColor: scoreDiag.bgColor },
                            ]}>
                            <MaterialIcons
                                name={scoreDiag.icon}
                                size={14}
                                color={scoreDiag.color}
                                style={styles.pillIcon}
                            />
                            <Text
                                style={[
                                    styles.badgeLabel,
                                    { color: scoreDiag.color, fontFamily: fontSemiBold },
                                ]}>
                                {scoreValue} pts • {scoreDiag.temperature}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 3. Barra de Ações Rápidas (Atalhos diretos e táteis) */}
                <View style={styles.quickActionsBar}>
                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={handleEdit}
                        activeOpacity={0.7}
                        disabled={deleting}>
                        <View style={styles.quickActionIconPod}>
                            <MaterialIcons name="edit" size={18} color="#080A96" />
                        </View>
                        <Text style={[styles.quickActionText, { fontFamily: fontMedium }]}>
                            Editar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={handleAskAi}
                        activeOpacity={0.7}>
                        <View style={[styles.quickActionIconPod, styles.aiIconPod]}>
                            <MaterialIcons name="auto-awesome" size={18} color="#7C3AED" />
                        </View>
                        <Text style={[styles.quickActionText, { fontFamily: fontMedium }]}>
                            Pedir à IA
                        </Text>
                    </TouchableOpacity>

                    {telefone ? (
                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => handleCall(telefone)}
                            activeOpacity={0.7}>
                            <View style={styles.quickActionIconPod}>
                                <MaterialIcons name="phone" size={18} color="#059669" />
                            </View>
                            <Text style={[styles.quickActionText, { fontFamily: fontMedium }]}>
                                Ligar
                            </Text>
                        </TouchableOpacity>
                    ) : null}

                    {email ? (
                        <TouchableOpacity
                            style={styles.quickActionBtn}
                            onPress={() => handleEmail(email)}
                            activeOpacity={0.7}>
                            <View style={styles.quickActionIconPod}>
                                <MaterialIcons name="mail-outline" size={18} color="#0284C7" />
                            </View>
                            <Text style={[styles.quickActionText, { fontFamily: fontMedium }]}>
                                E-mail
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.sectionDivider} />

                {/* 4. Seção: Qualificação Comercial e Termômetro de Oportunidade */}
                <Text style={[styles.sectionTitle, { fontFamily: fontSemiBold }]}>
                    QUALIFICAÇÃO NO FUNIL
                </Text>

                {/* Barra de Progresso do Score */}
                <View style={styles.scoreCardContainer}>
                    <View style={styles.scoreHeaderRow}>
                        <View style={styles.scoreTitleGroup}>
                            <MaterialIcons
                                name="speed"
                                size={18}
                                color={scoreDiag.color}
                                style={styles.scoreIcon}
                            />
                            <Text style={[styles.scoreTitle, { fontFamily: fontSemiBold }]}>
                                Score Comercial
                            </Text>
                        </View>
                        <Text style={[styles.scoreValueBig, { fontFamily: fontBold, color: scoreDiag.color }]}>
                            {scoreValue}
                            <Text style={styles.scoreMaxText}> / 100</Text>
                        </Text>
                    </View>

                    {/* Trilha do Score */}
                    <View style={styles.scoreTrack}>
                        <View
                            style={[
                                styles.scoreFill,
                                {
                                    width: `${scoreValue}%`,
                                    backgroundColor: scoreDiag.color,
                                },
                            ]}
                        />
                    </View>

                    <Text style={[styles.scoreTipText, { fontFamily: fontRegular }]}>
                        {scoreDiag.tip}
                    </Text>
                </View>

                {/* Linhas de Qualificação */}
                <View style={styles.dataGroup}>
                    <View style={styles.dataRow}>
                        <View style={styles.dataLabelCol}>
                            <MaterialIcons name="timeline" size={16} color="#64748B" style={styles.rowIcon} />
                            <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                Estágio Atual
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.rowPill,
                                { backgroundColor: statusCfg.backgroundColor },
                            ]}>
                            <Text
                                style={[
                                    styles.rowPillText,
                                    { color: statusCfg.color, fontFamily: fontSemiBold },
                                ]}>
                                {situacao}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.dataRow}>
                        <View style={styles.dataLabelCol}>
                            <MaterialIcons name="trending-up" size={16} color="#64748B" style={styles.rowIcon} />
                            <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                Potencial de Compra
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.rowPill,
                                { backgroundColor: `${potColor}18` },
                            ]}>
                            <Text
                                style={[
                                    styles.rowPillText,
                                    { color: potColor, fontFamily: fontSemiBold },
                                ]}>
                                {potencial}
                            </Text>
                        </View>
                    </View>

                    {createdFormatted ? (
                        <View style={styles.dataRow}>
                            <View style={styles.dataLabelCol}>
                                <MaterialIcons name="event" size={16} color="#64748B" style={styles.rowIcon} />
                                <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                    Cadastrado em
                                </Text>
                            </View>
                            <Text style={[styles.dataValue, { fontFamily: fontRegular }]}>
                                {createdFormatted}
                            </Text>
                        </View>
                    ) : null}

                    {updatedFormatted && updatedFormatted !== createdFormatted ? (
                        <View style={styles.dataRow}>
                            <View style={styles.dataLabelCol}>
                                <MaterialIcons name="update" size={16} color="#64748B" style={styles.rowIcon} />
                                <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                    Última Atualização
                                </Text>
                            </View>
                            <Text style={[styles.dataValue, { fontFamily: fontRegular }]}>
                                {updatedFormatted}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.sectionDivider} />

                {/* 5. Seção: Dados da Receita Federal (BrasilAPI) */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { fontFamily: fontSemiBold }]}>
                        DADOS DA RECEITA FEDERAL
                    </Text>
                    {loadingEnriched && (
                        <View style={styles.syncingTag}>
                            <ActivityIndicator size="small" color="#080A96" />
                            <Text style={[styles.syncingText, { fontFamily: fontRegular }]}>
                                Consultando...
                            </Text>
                        </View>
                    )}
                </View>

                {enrichedData ? (
                    <View style={styles.dataGroup}>
                        {situacaoCadastral ? (
                            <View style={styles.dataRow}>
                                <View style={styles.dataLabelCol}>
                                    <MaterialIcons name="verified" size={16} color="#059669" style={styles.rowIcon} />
                                    <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                        Situação Cadastral
                                    </Text>
                                </View>
                                <View style={styles.activeStatusPill}>
                                    <Text style={[styles.activeStatusText, { fontFamily: fontSemiBold }]}>
                                        {situacaoCadastral}
                                    </Text>
                                </View>
                            </View>
                        ) : null}

                        {cnae ? (
                            <View style={styles.dataColumnRow}>
                                <View style={styles.dataLabelCol}>
                                    <MaterialIcons name="category" size={16} color="#64748B" style={styles.rowIcon} />
                                    <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                        Atividade Principal (CNAE)
                                    </Text>
                                </View>
                                <Text style={[styles.dataValueMultiline, { fontFamily: fontRegular }]}>
                                    {cnae}
                                </Text>
                            </View>
                        ) : null}

                        {telefone ? (
                            <TouchableOpacity
                                style={styles.dataRow}
                                onPress={() => handleCall(telefone)}
                                activeOpacity={0.7}>
                                <View style={styles.dataLabelCol}>
                                    <MaterialIcons name="phone" size={16} color="#059669" style={styles.rowIcon} />
                                    <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                        Telefone
                                    </Text>
                                </View>
                                <View style={styles.clickableValueGroup}>
                                    <Text style={[styles.dataValueLink, { fontFamily: fontSemiBold }]}>
                                        {telefone}
                                    </Text>
                                    <MaterialIcons name="open-in-new" size={14} color="#080A96" />
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        {email ? (
                            <TouchableOpacity
                                style={styles.dataRow}
                                onPress={() => handleEmail(email)}
                                activeOpacity={0.7}>
                                <View style={styles.dataLabelCol}>
                                    <MaterialIcons name="email" size={16} color="#0284C7" style={styles.rowIcon} />
                                    <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                        E-mail
                                    </Text>
                                </View>
                                <View style={styles.clickableValueGroup}>
                                    <Text style={[styles.dataValueLink, { fontFamily: fontSemiBold }]}>
                                        {email}
                                    </Text>
                                    <MaterialIcons name="open-in-new" size={14} color="#080A96" />
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        {fullAddress ? (
                            <TouchableOpacity
                                style={styles.dataColumnRow}
                                onPress={() => handleOpenMap(fullAddress)}
                                activeOpacity={0.7}>
                                <View style={styles.dataLabelCol}>
                                    <MaterialIcons name="place" size={16} color="#DC2626" style={styles.rowIcon} />
                                    <Text style={[styles.dataLabel, { fontFamily: fontMedium }]}>
                                        Endereço & Localização
                                    </Text>
                                    <MaterialIcons name="open-in-new" size={13} color="#080A96" style={{ marginLeft: 6 }} />
                                </View>
                                <Text style={[styles.dataValueMultiline, { fontFamily: fontRegular, color: '#1E293B' }]}>
                                    {fullAddress}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                ) : (
                    <View style={styles.enrichedPlaceholder}>
                        <MaterialIcons
                            name="info-outline"
                            size={18}
                            color="#94A3B8"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.enrichedPlaceholderText, { fontFamily: fontRegular }]}>
                            {loadingEnriched
                                ? 'Consultando informações cadastrais via Receita Federal...'
                                : 'Dados complementares da Receita não disponíveis para este CNPJ.'}
                        </Text>
                    </View>
                )}

                <View style={styles.sectionDivider} />

                {/* 6. Ações Principais de Rodapé */}
                <View style={styles.footerActions}>
                    <Button
                        title="Editar Informações do Cliente"
                        onPress={handleEdit}
                        disabled={deleting}
                    />

                    <TouchableOpacity
                        style={styles.aiFullButton}
                        onPress={handleAskAi}
                        activeOpacity={0.8}
                        disabled={deleting}>
                        <MaterialIcons name="auto-awesome" size={18} color="#7C3AED" />
                        <Text style={[styles.aiFullButtonText, { fontFamily: fontSemiBold }]}>
                            Recomendações com Assistente IA
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteLink}
                        onPress={handleDelete}
                        activeOpacity={0.6}
                        disabled={deleting}>
                        <MaterialIcons name="delete-outline" size={16} color="#DC2626" />
                        <Text style={[styles.deleteLinkText, { fontFamily: fontMedium }]}>
                            Excluir esta oportunidade
                        </Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    headerSpacer: {
        width: 32,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },
    offlineBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderBottomWidth: 1,
        borderBottomColor: '#FECACA',
        paddingHorizontal: 20,
        paddingVertical: 9,
    },
    bannerIcon: {
        marginRight: 8,
    },
    offlineBannerText: {
        fontSize: 12,
        color: '#991B1B',
        flex: 1,
    },
    retryBannerText: {
        fontSize: 12,
        color: '#080A96',
        marginLeft: 8,
    },

    // 2. Hero Section
    heroSection: {
        marginBottom: 16,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    companyAvatar: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    heroTitles: {
        flex: 1,
    },
    companyName: {
        fontSize: 20,
        color: '#0F172A',
        lineHeight: 26,
        letterSpacing: -0.3,
    },
    fantasyName: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    cnpjRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    cnpjText: {
        fontSize: 13,
        color: '#475569',
        letterSpacing: 0.1,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 2,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    pillIcon: {
        marginRight: 4,
    },
    badgeLabel: {
        fontSize: 12,
    },

    // 3. Quick Actions
    quickActionsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    quickActionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
    },
    quickActionIconPod: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    aiIconPod: {
        backgroundColor: '#F3E8FF',
    },
    quickActionText: {
        fontSize: 11,
        color: '#334155',
    },

    // Sections & Dividers
    sectionDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 18,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        color: '#64748B',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    syncingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    syncingText: {
        fontSize: 11,
        color: '#64748B',
    },

    // 4. Score Progress
    scoreCardContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
    },
    scoreHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    scoreTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreIcon: {
        marginRight: 6,
    },
    scoreTitle: {
        fontSize: 13,
        color: '#0F172A',
    },
    scoreValueBig: {
        fontSize: 16,
    },
    scoreMaxText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: 'normal',
    },
    scoreTrack: {
        height: 7,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    scoreFill: {
        height: '100%',
        borderRadius: 4,
    },
    scoreTipText: {
        fontSize: 12,
        color: '#64748B',
        lineHeight: 17,
    },

    // 5. Data Groups & Rows (Clean minimal design, sem cards aninhados)
    dataGroup: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dataColumnRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dataLabelCol: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        marginRight: 8,
    },
    dataLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    dataValue: {
        fontSize: 13,
        color: '#0F172A',
    },
    dataValueMultiline: {
        fontSize: 13,
        color: '#334155',
        marginTop: 6,
        lineHeight: 18,
    },
    clickableValueGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dataValueLink: {
        fontSize: 13,
        color: '#080A96',
    },
    rowPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    rowPillText: {
        fontSize: 12,
    },
    activeStatusPill: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    activeStatusText: {
        fontSize: 11,
        color: '#059669',
    },
    enrichedPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
    },
    enrichedPlaceholderText: {
        fontSize: 12,
        color: '#64748B',
        flex: 1,
        lineHeight: 17,
    },

    // 6. Footer Actions
    footerActions: {
        marginTop: 8,
        gap: 12,
    },
    aiFullButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        height: 48,
        borderRadius: 10,
    },
    aiFullButtonText: {
        fontSize: 14,
        color: '#7C3AED',
    },
    deleteLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    deleteLinkText: {
        fontSize: 13,
        color: '#DC2626',
    },
});
