import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    Platform,
} from 'react-native';
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function Button({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
    ...rest
}) {
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
    });

    const fontSemiBold = fontsLoaded ? 'Inter_600SemiBold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });

    return (
        <TouchableOpacity
            style={[
                styles.button,
                (disabled || loading) && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.88}
            {...rest}>
            {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
                <Text style={[styles.text, { fontFamily: fontSemiBold }, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#080A96',
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#080A96',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 5,
        elevation: 3,
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

