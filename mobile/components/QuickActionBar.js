import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_700Bold, Inter_600SemiBold } from '@expo-google-fonts/inter';
import NeumorphicView from './NeumorphicView';

/**
 * QuickActionBar (Sway Finance Style)
 * 
 * Barra de atalhos rápidos com Neumorfismo sutil e tátil aplicado
 * exclusivamente nos botões de ação:
 * - Novo Cliente
 * - Lista de Clientes
 * - Assistente IA (com destaque Gemini)
 */
export default function QuickActionBar({
    onNewClient,
    onClientList,
    onAiAssistant,
    style,
}) {
    const [pressedId, setPressedId] = useState(null);

    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_600SemiBold,
    });

    const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontSemiBold = fontsLoaded ? 'Inter_600SemiBold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });

    const actions = [
        {
            id: 'new',
            title: 'Novo',
            sub: 'Cliente',
            icon: 'add-business',
            color: '#080A96',
            action: onNewClient,
        },
        {
            id: 'list',
            title: 'Lista',
            sub: 'Clientes',
            icon: 'people-alt',
            color: '#0284C7',
            action: onClientList,
        },
        {
            id: 'ai',
            title: 'Assistente',
            sub: 'IA Gemini',
            icon: 'auto-awesome',
            color: '#7C3AED',
            badge: 'IA',
            action: onAiAssistant,
        },
    ];

    return (
        <View style={[styles.container, style]}>
            {actions.map((item) => {
                const isPressed = pressedId === item.id;

                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={item.action}
                        onPressIn={() => setPressedId(item.id)}
                        onPressOut={() => setPressedId(null)}
                        activeOpacity={0.88}
                        style={styles.actionItem}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title} ${item.sub}`}>
                        <NeumorphicView
                            borderRadius={18}
                            depth={isPressed ? 0.3 : 0.8}
                            backgroundColor="#FFFFFF"
                            variant={isPressed ? 'recessed' : 'elevated'}
                            style={styles.neumorphicButton}
                            contentStyle={styles.buttonContent}>
                            
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconPod, { backgroundColor: `${item.color}14` }]}>
                                    <MaterialIcons name={item.icon} size={22} color={item.color} />
                                </View>
                                {item.badge && (
                                    <View style={[styles.badgePod, { backgroundColor: item.color }]}>
                                        <Text style={[styles.badgeText, { fontFamily: fontBold }]}>
                                            {item.badge}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={[styles.titleText, { fontFamily: fontSemiBold }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={[styles.subText, { color: isPressed ? item.color : '#64748B' }]} numberOfLines={1}>
                                {item.sub}
                            </Text>
                        </NeumorphicView>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionItem: {
        flex: 1,
        marginHorizontal: 4,
    },
    neumorphicButton: {
        width: '100%',
    },
    buttonContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 6,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    iconPod: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgePod: {
        position: 'absolute',
        top: -4,
        right: -6,
        paddingHorizontal: 5,
        paddingVertical: 1.5,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 9,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    titleText: {
        fontSize: 13,
        color: '#0F172A',
        letterSpacing: 0.1,
        textAlign: 'center',
    },
    subText: {
        fontSize: 11,
        letterSpacing: 0.2,
        marginTop: 2,
        textAlign: 'center',
    },
});
