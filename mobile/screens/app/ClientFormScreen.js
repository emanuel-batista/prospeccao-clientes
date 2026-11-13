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
import { FONTS } from '../../constants/fonts';

import api from '../../services/api';
import {
    BackButton,
    Button,
    ClientFormCnpjField,
    formatCnpjInput,
    extractCnpjDigits,
    ClientFormCepField,
    formatCepInput,
    extractCepDigits,
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

function getSuggestedScore(potential) {
    switch (normalizePotential(potential)) {
        case 'Baixo':
            return 25;
        case 'Alto':
            return 75;
        default:
            return 50;
    }
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
 * Tela limpa, direta e sem cards aninhados para cadastro e edição de clientes com integração de CEP.
 */
export default function ClientFormScreen({ navigation, route }) {
    const fontBold = FONTS.bold;
    const fontSemiBold = FONTS.semiBold;
    const fontMedium = FONTS.medium;
    const fontRegular = FONTS.regular;

    const routeClient = route.params?.client || null;
    const routeId = route.params?.id || routeClient?._id || routeClient?.id || null;
    const isEdit = Boolean(routeId || routeClient);

    // Campos principais
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

    // Campos de Endereço / CEP
    const [cep, setCep] = useState(() => formatCepInput(routeClient?.cep || ''));
    const [rua, setRua] = useState(routeClient?.rua || '');
    const [numero, setNumero] = useState(routeClient?.numero || '');
    const [complemento, setComplemento] = useState(routeClient?.complemento || '');
    const [bairro, setBairro] = useState(routeClient?.bairro || '');
    const [cidade, setCidade] = useState(routeClient?.cidade || '');
    const [estado, setEstado] = useState(routeClient?.estado || '');

    const [loadingClient, setLoadingClient] = useState(Boolean(!routeClient && routeId));
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errors, setErrors] = useState({});

    // Estados de foco para inputs
    const [razaoFocused, setRazaoFocused] = useState(false);
    const [ruaFocused, setRuaFocused] = useState(false);
    const [numeroFocused, setNumeroFocused] = useState(false);
    const [complementoFocused, setComplementoFocused] = useState(false);
    const [bairroFocused, setBairroFocused] = useState(false);
    const [cidadeFocused, setCidadeFocused] = useState(false);
    const [estadoFocused, setEstadoFocused] = useState(false);

    const [initialState, setInitialState] = useState(() => ({
        cnpj: formatCnpjInput(routeClient?.cnpj || routeClient?.document || route.params?.initialCnpj || ''),
        razaoSocial: routeClient?.razao_social || routeClient?.razaoSocial || routeClient?.name || '',
        situacao: normalizeStatus(routeClient?.situacao || routeClient?.situacaoComercial || routeClient?.status),
        potencialCompra: normalizePotential(routeClient?.potencial_compra || routeClient?.potencialCompra || routeClient?.potencial),
        score: Number(routeClient?.score ?? 50),
        cep: formatCepInput(routeClient?.cep || ''),
        rua: routeClient?.rua || '',
        numero: routeClient?.numero || '',
        complemento: routeClient?.complemento || '',
        bairro: routeClient?.bairro || '',
        cidade: routeClient?.cidade || '',
        estado: routeClient?.estado || '',
    }));

    const handlePotentialChange = (potential) => {
        setPotencialCompra(potential);
        setScore(getSuggestedScore(potential));
    };

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

                        const cp = formatCepInput(d.cep || '');
                        const ru = d.rua || '';
                        const nu = d.numero || '';
                        const co = d.complemento || '';
                        const ba = d.bairro || '';
                        const ci = d.cidade || '';
                        const es = d.estado || '';

                        setCnpj(c);
                        setRazaoSocial(r);
                        setSituacao(s);
                        setPotencialCompra(p);
                        setScore(sc);

                        setCep(cp);
                        setRua(ru);
                        setNumero(nu);
                        setComplemento(co);
                        setBairro(ba);
                        setCidade(ci);
                        setEstado(es);

                        setInitialState({
                            cnpj: c,
                            razaoSocial: r,
                            situacao: s,
                            potencialCompra: p,
                            score: sc,
                            cep: cp,
                            rua: ru,
                            numero: nu,
                            complemento: co,
                            bairro: ba,
                            cidade: ci,
                            estado: es,
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
            score !== initialState.score ||
            cep !== initialState.cep ||
            rua !== initialState.rua ||
            numero !== initialState.numero ||
            complemento !== initialState.complemento ||
            bairro !== initialState.bairro ||
            cidade !== initialState.cidade ||
            estado !== initialState.estado
        );
    }, [
        cnpj,
        razaoSocial,
        situacao,
        potencialCompra,
        score,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        initialState,
    ]);

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

    // Preenchimento via busca de CNPJ
    const handleCnpjAutofill = (data) => {
        if (data.razaoSocial) {
            setRazaoSocial(data.razaoSocial);
            setErrors((prev) => ({ ...prev, razaoSocial: undefined }));
        }
        if (data.cep) {
            setCep(formatCepInput(data.cep));
        }
        if (data.rua) setRua(data.rua);
        if (data.numero) setNumero(data.numero);
        if (data.complemento) setComplemento(data.complemento);
        if (data.bairro) setBairro(data.bairro);
        if (data.cidade) setCidade(data.cidade);
        if (data.estado) setEstado(data.estado);
    };

    // Preenchimento via busca de CEP
    const handleCepAutofill = (data) => {
        if (data.rua) setRua(data.rua);
        if (data.bairro) setBairro(data.bairro);
        if (data.cidade) setCidade(data.cidade);
        if (data.estado) setEstado(data.estado);
        if (data.complemento && !complemento) setComplemento(data.complemento);
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

        const cepDigits = extractCepDigits(cep);
        if (cepDigits && cepDigits.length !== 8) {
            errs.cep = 'CEP deve conter 8 dígitos.';
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
            cep: extractCepDigits(cep),
            rua: rua.trim(),
            numero: numero.trim(),
            complemento: complemento.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            estado: estado.trim(),
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
                            onAutofill={handleCnpjAutofill}
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

                        {/* Seção 2: Endereço e Localização */}
                        <Text style={[styles.sectionTitle, { fontFamily: fontSemiBold }]}>
                            ENDEREÇO E LOCALIZAÇÃO
                        </Text>

                        {/* Campo CEP com busca automática via ViaCEP */}
                        <ClientFormCepField
                            value={cep}
                            onChangeText={(t) => {
                                setCep(t);
                                if (errors.cep) setErrors((prev) => ({ ...prev, cep: undefined }));
                            }}
                            onAutofill={handleCepAutofill}
                            error={errors.cep}
                            disabled={submitting || deleting}
                        />

                        {/* Campo Logradouro / Rua */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                Logradouro / Rua
                            </Text>
                            <View
                                style={[
                                    styles.inputRow,
                                    ruaFocused && styles.inputRowFocused,
                                ]}>
                                <MaterialIcons
                                    name="signpost"
                                    size={18}
                                    color={ruaFocused ? '#080A96' : '#94A3B8'}
                                    style={styles.fieldIcon}
                                />
                                <TextInput
                                    style={[styles.textInput, { fontFamily: fontMedium }]}
                                    placeholder="Ex: Av. Paulista ou Rua das Flores"
                                    placeholderTextColor="#94A3B8"
                                    value={rua}
                                    onChangeText={setRua}
                                    editable={!submitting && !deleting}
                                    onFocus={() => setRuaFocused(true)}
                                    onBlur={() => setRuaFocused(false)}
                                />
                                {rua.length > 0 && !submitting && !deleting && (
                                    <TouchableOpacity
                                        onPress={() => setRua('')}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                        <MaterialIcons name="close" size={16} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Linha dupla: Número e Complemento */}
                        <View style={styles.rowTwoCols}>
                            <View style={[styles.fieldContainer, styles.colHalfLeft]}>
                                <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                    Número
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        numeroFocused && styles.inputRowFocused,
                                    ]}>
                                    <TextInput
                                        style={[styles.textInput, { fontFamily: fontMedium }]}
                                        placeholder="123"
                                        placeholderTextColor="#94A3B8"
                                        value={numero}
                                        onChangeText={setNumero}
                                        editable={!submitting && !deleting}
                                        onFocus={() => setNumeroFocused(true)}
                                        onBlur={() => setNumeroFocused(false)}
                                    />
                                </View>
                            </View>

                            <View style={[styles.fieldContainer, styles.colHalfRight]}>
                                <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                    Complemento
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        complementoFocused && styles.inputRowFocused,
                                    ]}>
                                    <TextInput
                                        style={[styles.textInput, { fontFamily: fontMedium }]}
                                        placeholder="Sala, Andar..."
                                        placeholderTextColor="#94A3B8"
                                        value={complemento}
                                        onChangeText={setComplemento}
                                        editable={!submitting && !deleting}
                                        onFocus={() => setComplementoFocused(true)}
                                        onBlur={() => setComplementoFocused(false)}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Campo Bairro */}
                        <View style={styles.fieldContainer}>
                            <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                Bairro
                            </Text>
                            <View
                                style={[
                                    styles.inputRow,
                                    bairroFocused && styles.inputRowFocused,
                                ]}>
                                <MaterialIcons
                                    name="location-city"
                                    size={18}
                                    color={bairroFocused ? '#080A96' : '#94A3B8'}
                                    style={styles.fieldIcon}
                                />
                                <TextInput
                                    style={[styles.textInput, { fontFamily: fontMedium }]}
                                    placeholder="Bairro ou Distrito"
                                    placeholderTextColor="#94A3B8"
                                    value={bairro}
                                    onChangeText={setBairro}
                                    editable={!submitting && !deleting}
                                    onFocus={() => setBairroFocused(true)}
                                    onBlur={() => setBairroFocused(false)}
                                />
                            </View>
                        </View>

                        {/* Linha dupla: Cidade e Estado */}
                        <View style={styles.rowTwoCols}>
                            <View style={[styles.fieldContainer, styles.colCity]}>
                                <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                    Cidade
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        cidadeFocused && styles.inputRowFocused,
                                    ]}>
                                    <TextInput
                                        style={[styles.textInput, { fontFamily: fontMedium }]}
                                        placeholder="Cidade"
                                        placeholderTextColor="#94A3B8"
                                        value={cidade}
                                        onChangeText={setCidade}
                                        editable={!submitting && !deleting}
                                        onFocus={() => setCidadeFocused(true)}
                                        onBlur={() => setCidadeFocused(false)}
                                    />
                                </View>
                            </View>

                            <View style={[styles.fieldContainer, styles.colState]}>
                                <Text style={[styles.fieldLabel, { fontFamily: fontSemiBold }]}>
                                    UF
                                </Text>
                                <View
                                    style={[
                                        styles.inputRow,
                                        estadoFocused && styles.inputRowFocused,
                                    ]}>
                                    <TextInput
                                        style={[styles.textInput, { fontFamily: fontMedium, textTransform: 'uppercase' }]}
                                        placeholder="UF"
                                        placeholderTextColor="#94A3B8"
                                        value={estado}
                                        onChangeText={(t) => setEstado(t.toUpperCase().slice(0, 2))}
                                        maxLength={2}
                                        autoCapitalize="characters"
                                        editable={!submitting && !deleting}
                                        onFocus={() => setEstadoFocused(true)}
                                        onBlur={() => setEstadoFocused(false)}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Divisor sutil */}
                        <View style={styles.sectionDivider} />

                        {/* Seção 3: Qualificação */}
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
                            onChange={handlePotentialChange}
                            disabled={submitting || deleting}
                        />
                        <Text style={[styles.scoreSuggestion, { fontFamily: fontRegular }]}>
                            Score sugerido: {getSuggestedScore(potencialCompra)} pontos. Você pode ajustá-lo abaixo.
                        </Text>

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
    scoreSuggestion: {
        fontSize: 12,
        color: '#64748B',
        marginTop: -12,
        marginBottom: 14,
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
    rowTwoCols: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    colHalfLeft: {
        flex: 1,
        marginRight: 10,
    },
    colHalfRight: {
        flex: 1,
    },
    colCity: {
        flex: 2,
        marginRight: 10,
    },
    colState: {
        flex: 1,
    },
});
