import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Logo, Input, Button, AuthLink } from '../../components';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos obrigatórios', 'Por favor, informe seu e-mail e senha.');
            return;
        }

        try {
            setLoading(true);
            await login(email.trim(), password);
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'E-mail ou senha inválidos. Tente novamente.';
            Alert.alert('Erro ao entrar', errorMsg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    
                    {/* Seção Superior com Logotipo Vetorial */}
                    <View style={styles.logoSection}>
                        <Logo size={74} color="#080A96" />
                    </View>

                    {/* Formulário com Componentes Reutilizáveis */}
                    <View style={styles.formContainer}>
                        <Input
                            icon="mail-outline"
                            placeholder="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Input
                            icon="lock-outline"
                            placeholder="Senha"
                            value={password}
                            onChangeText={setPassword}
                            isPassword
                            autoCapitalize="none"
                        />

                        {/* Botão de Ação Primário */}
                        <Button
                            title="Entrar"
                            onPress={handleLogin}
                            loading={loading}
                        />

                        {/* Link de Navegação para o Registro */}
                        <AuthLink
                            text="Não possui conta?"
                            boldText="Clique para registrar"
                            onPress={() => navigation.navigate('Register')}
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 36,
        paddingVertical: 24,
    },
    logoSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 56,
    },
    formContainer: {
        width: '100%',
    },
});
