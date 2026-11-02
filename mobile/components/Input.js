import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';

export default function Input({
    icon,
    placeholder,
    value,
    onChangeText,
    isPassword = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    error,
    containerStyle,
    inputStyle,
    ...rest
}) {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [fontsLoaded] = useFonts({
        Inter_400Regular,
    });

    const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.select({ ios: 'System', android: 'sans-serif' });

    return (
        <View style={[styles.container, containerStyle]}>
            <View
                style={[
                    styles.inputRow,
                    focused && styles.inputRowFocused,
                    error && styles.inputRowError,
                ]}>
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={20}
                        color={error ? '#D32F2F' : focused ? '#080A96' : '#687076'}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, { fontFamily: fontRegular }, inputStyle]}
                    placeholder={placeholder}
                    placeholderTextColor="#787F85"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...rest}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.toggleButton}>
                        <MaterialIcons
                            name={showPassword ? 'visibility' : 'visibility-off'}
                            size={20}
                            color="#687076"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
        width: '100%',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#A3A3A3',
        paddingBottom: 8,
        paddingHorizontal: 2,
    },
    inputRowFocused: {
        borderBottomColor: '#080A96',
        borderBottomWidth: 1.8,
    },
    inputRowError: {
        borderBottomColor: '#D32F2F',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1C1E21',
        paddingVertical: 4,
    },
    toggleButton: {
        padding: 4,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 2,
    },
});

