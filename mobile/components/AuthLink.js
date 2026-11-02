import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useFonts, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function AuthLink({
    text,
    boldText,
    onPress,
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_500Medium,
        Inter_600SemiBold,
    });

    const fontMedium = fontsLoaded ? 'Inter_500Medium' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontSemiBold = fontsLoaded ? 'Inter_600SemiBold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, style]}
            activeOpacity={0.7}>
            <Text style={[styles.text, { fontFamily: fontMedium }]}>
                {text} <Text style={[styles.boldText, { fontFamily: fontSemiBold }]}>{boldText}</Text>
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 18,
        alignItems: 'center',
        paddingVertical: 6,
    },
    text: {
        fontSize: 13,
        color: '#4A4A4A',
        textAlign: 'center',
    },
    boldText: {
        color: '#080A96',
        fontWeight: '600',
    },
});

