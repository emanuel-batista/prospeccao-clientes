import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * NeumorphicView
 * 
 * Reproduz o relevo tátil suave em tema claro com luz superior (#FFFFFF)
 * e sombra inferior (#CBD5E1), utilizado nos botões de ação rápida.
 */
export default function NeumorphicView({
    children,
    style,
    contentStyle,
    borderRadius = 16,
    variant = 'elevated', // 'elevated' | 'recessed'
    depth = 0.8,
    backgroundColor = '#FFFFFF',
    ...rest
}) {
    if (variant === 'recessed') {
        return (
            <View
                style={[
                    styles.recessedBase,
                    { borderRadius },
                    style,
                ]}
                {...rest}>
                <View style={[styles.innerContent, contentStyle]}>{children}</View>
            </View>
        );
    }

    const offsetMagnitude = Math.max(2, Math.round(3 * depth));
    const radiusMagnitude = Math.max(3, Math.round(5 * depth));

    return (
        <View
            style={[
                styles.lightShadowContainer,
                {
                    borderRadius,
                    shadowRadius: radiusMagnitude,
                    shadowOffset: { width: -offsetMagnitude, height: -offsetMagnitude },
                },
                style,
            ]}
            {...rest}>
            <View
                style={[
                    styles.darkShadowContainer,
                    {
                        borderRadius,
                        backgroundColor,
                        shadowRadius: radiusMagnitude,
                        shadowOffset: { width: offsetMagnitude, height: offsetMagnitude },
                    },
                    Platform.select({
                        web: {
                            boxShadow: `${offsetMagnitude}px ${offsetMagnitude}px ${radiusMagnitude * 2}px rgba(203, 213, 225, 0.45), -${offsetMagnitude}px -${offsetMagnitude}px ${radiusMagnitude * 2}px rgba(255, 255, 255, 0.9)`,
                        },
                    }),
                    contentStyle,
                ]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    lightShadowContainer: {
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.9,
        backgroundColor: 'transparent',
    },
    darkShadowContainer: {
        shadowColor: '#CBD5E1',
        shadowOpacity: 0.5,
        ...Platform.select({
            android: {
                elevation: 2,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderTopColor: '#FFFFFF',
                borderLeftColor: '#FFFFFF',
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderRightColor: '#E2E8F0',
                borderBottomColor: '#E2E8F0',
            },
            ios: {
                borderWidth: 1,
                borderColor: '#F1F5F9',
            },
            web: {
                borderWidth: 1,
                borderColor: '#F1F5F9',
            },
            default: {
                borderWidth: 1,
                borderColor: '#F1F5F9',
            },
        }),
    },
    recessedBase: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
            },
            android: {
                elevation: 0,
            },
            web: {
                boxShadow: 'inset 2px 2px 4px rgba(203, 213, 225, 0.6), inset -2px -2px 4px rgba(255, 255, 255, 0.9)',
            },
        }),
    },
    innerContent: {
        width: '100%',
        height: '100%',
    },
});
