import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const aiOrbImage = require('../assets/ai-orb.png');

/**
 * AiOrb
 * Renderiza a esfera oficial da IA (ai-orb.png) com animação suave de flutuação/pulsação
 * e reflexo luminoso opcional no piso para o estado Hero ou como avatar compacto nas mensagens.
 */
export default function AiOrb({
    size = 160,
    showReflection = false,
    animated = false,
    isThinking = false,
    style,
}) {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!animated && !isThinking) {
            floatAnim.setValue(0);
            pulseAnim.setValue(1);
            return;
        }

        const duration = isThinking ? 1000 : 2800;

        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -6,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: isThinking ? 1.08 : 1.03,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        floatLoop.start();
        pulseLoop.start();

        return () => {
            floatLoop.stop();
            pulseLoop.stop();
        };
    }, [animated, isThinking, floatAnim, pulseAnim]);

    const reflectionHeight = Math.round(size * 0.24);

    return (
        <View style={[styles.wrapper, style]}>
            <Animated.View
                style={{
                    width: size,
                    height: size,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [
                        { translateY: animated || isThinking ? floatAnim : 0 },
                        { scale: animated || isThinking ? pulseAnim : 1 },
                    ],
                }}>
                <Image
                    source={aiOrbImage}
                    style={{ width: size, height: size }}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Reflexo luminoso suave no piso (para o destaque Hero) */}
            {showReflection && (
                <View
                    style={[
                        styles.reflectionContainer,
                        { width: size * 0.82, height: reflectionHeight },
                    ]}>
                    <Svg
                        width={size * 0.82}
                        height={reflectionHeight}
                        viewBox="0 0 170 44">
                        <Defs>
                            <RadialGradient
                                id="floorReflection"
                                cx="50%"
                                cy="30%"
                                rx="46%"
                                ry="46%"
                                fx="50%"
                                fy="30%">
                                <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
                                <Stop offset="50%" stopColor="#080A96" stopOpacity="0.14" />
                                <Stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
                            </RadialGradient>
                        </Defs>
                        <Ellipse
                            cx="85"
                            cy="16"
                            rx="74"
                            ry="16"
                            fill="url(#floorReflection)"
                        />
                    </Svg>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    reflectionContainer: {
        marginTop: -4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
});
