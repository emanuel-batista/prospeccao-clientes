import React, {
    useState,
    useEffect,
    useCallback,
    useLayoutEffect,
    useMemo,
} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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
    ClientFormCnpjField,
    formatCnpjInput,
    extractCnpjDigits,
    ClientFormStatusSelector,
    ClientFormPotentialSelector,
    ClientFormScoreSelector,
} from '../../components';

function normalizePotential(value) {
    if (!value) return 'Médio';
    const v = String(value).toLowerCase();
    if (v.includes('alt')) return 'Alto';
    if (v.includes('baix')) return 'Baixo';
    return 'Médio';
}

function normalizeStatus(value) {
    if (!value) return 'Novo';
    const v = String(value).toLowerCase();
    if (v.includes('perdid')) return 'Perdido';
    if (v.includes('fechad') || v.includes('convertid')) return 'Fechado';
    if (v.includes('negocia')) return 'Em Negociação';
    if (v.includes('contato') || v.includes('prospec') || v.includes('acompanh')) return 'Em Contato';
    return 'Novo';
}

/**
 * ClientFormScreen
 * Tela limpa, direta e sem cards aninhados para cadastro e edição de clientes.
 */
export default function ClientFormScreen({ navigation, route }) {
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
    const routeId = route.params?.id || routeClient?._id || routeClient?.id || null;
    const isEdit = Boolean(routeId || routeClient);

    const [cnpj, setCnpj] = useState(() =>
        formatCnpjInput(routeClient?.cnpj || routeClient?.document || route.params?.initialCnpj || '')
    );
    const [razaoSocial, setRazaoSocial] = useState(
        routeClient?.razao_social || routeClient?.razaoSocial || routeClient?.name || ''
    );
    const [situacao, setSituacao] = useState(() =>
        normalizeStatus(routeClient?.situacao || routeClient?.situacaoComercial || routeClient?.status)
    );
    const [potencialCompra, setPotencialCompra] = useState(() =>
        normalizePotential(routeClient?.potencial_compra || routeClient?.potencialCompra || routeClient?.potencial)
    );
    const [score, setScore] = useState(Number(routeClient?.score ?? 50));

    const [loadingClient, setLoadingClient] = useState(Boolean(!routeClient && routeId));
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const [razaoFocused, setRazaoFocused] = useState(false);

    const [initialState, setInitialState] = useState(() => ({
        cnpj: formatCnpjInput(routeClient?.cnpj || routeClient?.document || route.params?.initialCnpj || ''),
        razaoSocial: routeClient?.razao_social || routeClient?.razaoSocial || routeClient?.name || '',
        situacao: normalizeStatus(routeClient?.situacao || routeClient?.situacaoComercial || routeClient?.status),
        potencialCompra: normalizePotential(routeClient?.potencial_compra || routeClient?.potencialCompra || routeClient?.potencial),
        score: Number(routeClient?.score ?? 50),
    }));

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    useEffect(() => {
        if (!routeClient && routeId) {
            let isMounted = true;
            setLoadingClient(true);

            api.get(`/clients/${routeId}`)
                .then((res) => {
                    if (!isMounted) return;
                    const d = res.data;
                    if (d) {
                        const c = formatCnpjInput(d.cnpj || d.document || '');
                        const r = d.razao_social || d.razaoSocial || d.name || '';
                        const s = normalizeStatus(d.situacao || d.situacaoComercial || d.status);
                        const p = normalizePotential(d.potencial_compra || d.potencialCompra || d.potencial);
                        const sc = Number(d.score ?? 50);

                        setCnpj(c);
                        setRazaoSocial(r);
                        setSituacao(s);
                        setPotencialCompra(p);
                        setScore(sc);

                        setInitialState({
                            cnpj: c,
                            razaoSocial: r,
                            situacao: s,
                            potencialCompra: p,
                            score: sc,
                        });
                    }
                })
                .catch(() => {
                    Alert.alert('Erro', 'Não foi possível carregar os dados deste cliente.');
                })
                .finally(() => {
                    if (isMounted) setLoadingClient(false);
                });

            return () => {
                isMounted = false;
            };
        }
    }, [routeClient, routeId]);

    const isDirty = useMemo(() => {
        return (
            cnpj !== initialState.cnpj ||
            razaoSocial !== initialState.razaoSocial ||
            situacao !== initialState.situacao ||
            potencialCompra !== initialState.potencialCompra ||
            score !== initialState.score
        );
    }, [cnpj, razaoSocial, situacao, potencialCompra, score, initialState]);

    const handleGoBack = useCallback(() => {
        if (!isDirty) {
            navigation.goBack();
            return;
        }

        const msg = 'Existem alterações não salvas. Deseja sair e descartar?';
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm(msg)) {
                navigation.goBack();
            }
        } else {
            Alert.alert('Descartar alterações?', msg, [
                { text: 'Continuar editando', style: 'cancel' },
                { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
            ]);
        }
    }, [isDirty, navigation]);

    const handleAutofill = (data) => {
        if (data.razaoSocial) {
            setRazaoSocial(data.razaoSocial);
            setErrors((prev) => ({ ...prev, razaoSocial: undefined }));
        }
    };

    const validate = () => {
        const errs = {};
        const digits = extractCnpjDigits(cnpj);

        if (!digits) {
            errs.cnpj = 'Informe o CNPJ.';
        } else if (digits.length !== 14) {
            errs.cnpj = `CNPJ incompleto (${digits.length}/14 dígitos).`;
        }

        if (!razaoSocial.trim()) {
            errs.razaoSocial = 'Informe a Razão Social da empresa.';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);

        const payload = {
            cnpj: extractCnpjDigits(cnpj),
            razao_social: razaoSocial.trim(),
            situacao,
            potencial_compra: potencialCompra,
            score: Number(score) || 0,
        };

        try {
            if (isEdit) {
                await api.put(`/clients/${routeId}`, payload);
            } else {
                await api.post('/clients', payload);
            }
            navigation.goBack();
        } catch (err) {
            const msg =
                err.response?.data?.erro ||
                err.response?.data?.message ||
                'Erro ao salvar os dados. Tente novamente.';
            Alert.alert('Erro', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        const msg = `Deseja remover "${razaoSocial}"? Esta ação não pode ser desfeita.`;

        const doDelete = async () => {
            setDeleting(true);
            try {
                await api.delete(`/clients/${routeId}`);
                navigation.goBack();
            } catch (err) {
                Alert.alert('Erro', 'Não foi possível excluir o cliente.');
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

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Cabeçalho minimalista */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <BackButton onPress={handleGoBack} />
                    <Text style={[styles.headerTitle, { fontFamily: fontBold }]}>
                        {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
                    </Text>
                </View>

                {isEdit && (
                    <TouchableOpacity
                        onPress={handleDelete}
                        disabled={submitting || deleting}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.deleteHeaderBtn}
                        accessibilityLabel="Excluir este cliente">
                        {deleting ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                        ) : (
                            <MaterialIcons name="delete-outline" size={22} color="#DC2626" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {loadingClient ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#080A96" />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled">
                        
                        {/* Seção 1: Dados da Empresa */}
                        <Text style={[styles.sectionTitle, { fontFamily: fontSemiBold }]}>
                            DADOS DA EMPRESA
                        </Text>

                        {/* Campo CNPJ */}
                        <ClientFormCnpjField
                            value={cnpj}
                            onChangeText={(t) => {
                                setCnpj(t);
                                if (errors.cnpj) setErrors((prev) => ({ ...prev, cnpj: undefined }));
                            }}
                            onAutofill={handleAutofill}
                            error={errors.cnpj}
                            disabled={submitting || deleting}
                        />

                        {/* Campo Razão Social */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                Razão Social <Text style={styles.required}>*</Text>
                            </Text>

                            <View
                                style={[
                                    styles.inputRow,
                                    razaoFocused && styles.inputRowFocused,
                                    errors.razaoSocial && styles.inputRowError,
                                ]}>
                                <MaterialIcons
                                    name="storefront"
                                    size={18}
                                    color={errors.razaoSocial ? '#DC2626' : razaoFocused ? '#080A96' : '#94A3B8'}
                                    style={styles.fieldIcon}
                                />
                                <TextInput
                                    style={[styles.textInput, { fontFamily: fontMedium }]}
                                    placeholder="Nome ou Razão Social"
                                    placeholderTextColor="#94A3B8"
                                    value={razaoSocial}
                                    onChangeText={(t) => {
                                        setRazaoSocial(t);
                                        if (errors.razaoSocial) {
                                            setErrors((prev) => ({ ...prev, razaoSocial: undefined }));
                                        }
                                    }}
                                    autoCapitalize="words"
                                    editable={!submitting && !deleting}
                                    onFocus={() => setRazaoFocused(true)}
                                    onBlur={() => setRazaoFocused(false)}
                                />
                                {razaoSocial.length > 0 && !submitting && !deleting && (
                                    <TouchableOpacity
                                        onPress={() => setRazaoSocial('')}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                        <MaterialIcons name="close" size={16} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {errors.razaoSocial ? (
                                <Text style={[styles.fieldError, { fontFamily: fontRegular }]}>
                                    {errors.razaoSocial}
                                </Text>
                            ) : null}
                        </View>

                        {/* Divisor sutil */}
                        <View style={styles.sectionDivider} />

                        {/* Seção 2: Qualificação */}
                        <Text style={[styles.sectionTitle, { fontFamily: fontSemiBold }]}>
                            QUALIFICAÇÃO COMERCIAL
                        </Text>

                        {/* Estágio no Funil */}
                        <ClientFormStatusSelector
                            value={situacao}
                            onChange={setSituacao}
                            disabled={submitting || deleting}
                        />

                        {/* Potencial de Compra */}
                        <ClientFormPotentialSelector
                            value={potencialCompra}
                            onChange={setPotencialCompra}
                            disabled={submitting || deleting}
                        />

                        {/* Score */}
                        <ClientFormScoreSelector
                            value={score}
                            onChange={setScore}
                            disabled={submitting || deleting}
                        />

                        {/* Botão Salvar */}
                        <View style={styles.actionRow}>
                            <Button
                                title={isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                                onPress={handleSubmit}
                                loading={submitting}
                                disabled={deleting}
                            />
                        </View>
                    </ScrollView>
                )}
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
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        fontSize: 18,
        color: '#0F172A',
        letterSpacing: -0.2,
    },
    deleteHeaderBtn: {
        padding: 4,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        color: '#64748B',
        letterSpacing: 0.8,
        marginBottom: 14,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 18,
    },
    fieldContainer: {
        marginBottom: 16,
        width: '100%',
    },
    fieldLabel: {
        fontSize: 13,
        color: '#0F172A',
        marginBottom: 6,
        letterSpacing: -0.1,
    },
    required: {
        color: '#DC2626',
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
    fieldIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#0F172A',
        paddingVertical: 0,
    },
    fieldError: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 4,
        paddingLeft: 2,
    },
    actionRow: {
        marginTop: 8,
    },
});
