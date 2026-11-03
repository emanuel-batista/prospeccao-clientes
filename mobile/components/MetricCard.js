import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Inter_700Bold, Inter_600SemiBold, Inter_400Regular } from '@expo-google-fonts/inter';

/**
 * MetricCard (Sway Finance / Modern Fintech Style)
 * 
 * Componente modular em tema claro com tipografia nítida e alto contraste:
 * - Modo 'hero': Card azul marinho institucional (#080A96) para a métrica Total.
 * - Modo 'default': Cards limpos em fundo branco (#FFFFFF) com bordas finas e pods pastel.
 */
export default function MetricCard({
    title,
    value,
    icon,
    accentColor = '#080A96',
    subtitle,
    variant = 'default', // 'hero' | 'default'
    loading = false,
    onPress,
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_700Bold,
        Inter_600SemiBold,
        Inter_400Regular,
    });

    const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontSemiBold = fontsLoaded ? 'Inter_600SemiBold' : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.select({ ios: 'System', android: 'sans-serif' });

    const isHero = variant === 'hero';

    const cardBody = (
        <View
            style={[
                styles.baseCard,
                isHero ? styles.heroCard : styles.defaultCard,
                style,
            ]}>
            {/* Linha Superior: Ícone */}
            <View style={styles.topRow}>
                <View
                    style={[
                        styles.iconPod,
                        isHero
                            ? styles.heroIconPod
                            : { backgroundColor: `${accentColor}14` },
                    ]}>
                    <MaterialIcons
                        name={icon}
                        size={isHero ? 24 : 20}
                        color={isHero ? '#FFFFFF' : accentColor}
                    />
                </View>
            </View>

            {/* Valor Numérico Central */}
            <View style={styles.valueRow}>
                {loading ? (
                    <ActivityIndicator
                        size="small"
                        color={isHero ? '#FFFFFF' : accentColor}
                        style={styles.loader}
                    />
                ) : (
                    <Text
                        style={[
                            styles.valueText,
                            isHero ? styles.heroValueText : styles.defaultValueText,
                            { fontFamily: fontBold },
                        ]}>
                        {value !== undefined && value !== null ? value : 0}
                    </Text>
                )}
            </View>

            {/* Título e Subtítulo */}
            <View style={styles.labelSection}>
                <Text
                    style={[
                        styles.titleText,
                        isHero ? styles.heroTitleText : styles.defaultTitleText,
                        { fontFamily: fontSemiBold },
                    ]}
                    numberOfLines={1}>
                    {title}
                </Text>
                {subtitle ? (
                    <Text
                        style={[
                            styles.subtitleText,
                            isHero ? styles.heroSubtitleText : styles.defaultSubtitleText,
                            { fontFamily: fontRegular },
                        ]}
                        numberOfLines={1}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.85}
                style={isHero ? styles.touchableHero : styles.touchableDefault}>
                {cardBody}
            </TouchableOpacity>
        );
    }

    return cardBody;
}

const styles = StyleSheet.create({
    touchableHero: {
        width: '100%',
        marginBottom: 16,
    },
    touchableDefault: {
        flex: 1,
        marginBottom: 12,
    },
    baseCard: {
        borderRadius: 20,
        padding: 16,
        justifyContent: 'space-between',
        position: 'relative',
    },
    heroCard: {
        backgroundColor: '#080A96',
        paddingHorizontal: 20,
        paddingVertical: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#080A96',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.28,
                shadowRadius: 12,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 8px 24px rgba(8, 10, 150, 0.22)',
            },
        }),
    },
    defaultCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 132,
        ...Platform.select({
            ios: {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
            },
        }),
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    iconPod: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroIconPod: {
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
    valueRow: {
        marginTop: 10,
        marginBottom: 6,
    },
    loader: {
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    valueText: {
        letterSpacing: -0.5,
    },
    heroValueText: {
        fontSize: 36,
        color: '#FFFFFF',
    },
    defaultValueText: {
        fontSize: 26,
        color: '#0F172A',
    },
    labelSection: {
        marginTop: 2,
    },
    titleText: {
        letterSpacing: 0.1,
    },
    heroTitleText: {
        fontSize: 15,
        color: '#E0E7FF',
    },
    defaultTitleText: {
        fontSize: 13,
        color: '#334155',
    },
    subtitleText: {
        marginTop: 2,
    },
    heroSubtitleText: {
        fontSize: 12,
        color: '#C7D2FE',
    },
    defaultSubtitleText: {
        fontSize: 11,
        color: '#94A3B8',
    },
});
