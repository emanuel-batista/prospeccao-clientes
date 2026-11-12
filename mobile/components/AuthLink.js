import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FONTS } from '../constants/fonts';

export default function AuthLink({
    text,
    boldText,
    onPress,
    style,
}) {
    const fontMedium = FONTS.medium;
    const fontSemiBold = FONTS.semiBold;

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

