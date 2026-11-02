import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, AvatarPicker, BackButton, AuthLink } from '../../components';

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();

    const [avatarUri, setAvatarUri] = useState(null);
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [document, setDocument] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const [fontsLoaded] = useFonts({
        Inter_500Medium,
    });

    const fontMedium = fontsLoaded ? 'Inter_500Medium' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });

    // Máscara dinâmica para CPF (11 dígitos) ou CNPJ (14 dígitos)
    function handleDocumentChange(text) {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length <= 11) {
            // CPF: 000.000.000-00
            let masked = cleaned;
            if (cleaned.length > 3) masked = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
            if (cleaned.length > 6) masked = `${masked.slice(0, 7)}.${cleaned.slice(6)}`;
            if (cleaned.length > 9) masked = `${masked.slice(0, 11)}-${cleaned.slice(9, 11)}`;
            setDocument(masked);
        } else {
            // CNPJ: 00.000.000/0000-00
            const cnpj = cleaned.slice(0, 14);
            let masked = cnpj;
            if (cnpj.length > 2) masked = `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
            if (cnpj.length > 5) masked = `${masked.slice(0, 6)}.${cnpj.slice(5)}`;
            if (cnpj.length > 8) masked = `${masked.slice(0, 10)}/${cnpj.slice(8)}`;
            if (cnpj.length > 12) masked = `${masked.slice(0, 15)}-${cnpj.slice(12, 14)}`;
            setDocument(masked);
        }
    }

    async function handleRegister() {
        if (!name.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, informe seu nome completo.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            Alert.alert('E-mail inválido', 'Por favor, insira um endereço de e-mail válido.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Senha fraca', 'A senha deve conter no mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Senhas não coincidem', 'A confirmação de senha é diferente da senha digitada.');
            return;
        }

        try {
            setLoading(true);
            await register(
                name.trim(),
                email.trim(),
                password,
                companyName.trim(),
                document.trim(),
                avatarUri
            );
            Alert.alert('Conta criada com sucesso!', 'Seu cadastro foi realizado. Agora você já pode entrar na sua conta.', [
                { text: 'Ir para o Login', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Não foi possível concluir o registro. Tente novamente.';
            Alert.alert('Erro no cadastro', errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                
                {/* Cabeçalho com botão Voltar componentizado */}
                <View style={styles.header}>
                    <BackButton onPress={() => navigation.goBack()} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    
                    {/* Seletor de Foto de Perfil / Logotipo da Empresa */}
                    <View style={styles.avatarSection}>
                        <AvatarPicker
                            imageUri={avatarUri}
                            onChangeImage={setAvatarUri}
                            size={88}
                        />
                        <Text style={[styles.avatarHint, { fontFamily: fontMedium }]}>
                            {avatarUri ? 'Toque para alterar a imagem' : 'Toque para adicionar foto ou logo'}
                        </Text>
                    </View>

                    {/* Formulário com Componentes Reutilizáveis */}
                    <View style={styles.formContainer}>
                        <Input
                            icon="person-outline"
                            placeholder="Nome completo *"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />

                        <Input
                            icon="business"
                            placeholder="Nome da sua empresa"
                            value={companyName}
                            onChangeText={setCompanyName}
                            autoCapitalize="words"
                        />

                        <Input
                            icon="badge"
                            placeholder="CPF ou CNPJ"
                            value={document}
                            onChangeText={handleDocumentChange}
                            keyboardType="numeric"
                            autoCapitalize="none"
                        />

                        <Input
                            icon="mail-outline"
                            placeholder="E-mail *"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Input
                            icon="lock-outline"
                            placeholder="Senha (mínimo 6 caracteres) *"
                            value={password}
                            onChangeText={setPassword}
                            isPassword
                            autoCapitalize="none"
                        />

                        <Input
                            icon="lock-outline"
                            placeholder="Confirmar senha *"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isPassword
                            autoCapitalize="none"
                        />

                        {/* Botão Registrar Componentizado */}
                        <Button
                            title="Registrar"
                            onPress={handleRegister}
                            loading={loading}
                        />

                        {/* Link de Retorno Componentizado */}
                        <AuthLink
                            text="Já possui uma conta?"
                            boldText="Faça login"
                            onPress={() => navigation.navigate('Login')}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#EAEAEA',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 4,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 36,
        paddingBottom: 32,
    },
    avatarSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
        marginBottom: 28,
    },
    avatarHint: {
        fontSize: 12,
        color: '#687076',
        marginTop: 8,
    },
    formContainer: {
        width: '100%',
    },
});
