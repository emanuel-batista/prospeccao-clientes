import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function BackButton({ onPress, style, color = '#1F2328', size = 26 }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.button, style]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Voltar"
            activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={size} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 6,
        marginLeft: -6,
        alignSelf: 'flex-start',
    },
});

