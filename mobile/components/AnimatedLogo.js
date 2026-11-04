import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import Logo from './Logo';

const logoVideoSource = require('../assets/Logo-animada.mp4');

/**
 * Componente da logo animada (Logo-animada.mp4):
 * - Dimensões e proporções 1:1 nativas da logo (400x400).
 * - Fundo #EAEAEA integrado à tela de login.
 * - Base vetorial com <Logo /> para garantir que em repouso e após navegação nunca fique preta.
 * - Reproduz 1x após 3 segundos da abertura.
 * - Ao tocar na logo, reinicia e reproduz novamente (sem loop).
 * - Utiliza surfaceType="textureView" para compatibilidade total com navegação no Android.
 *
 * @param {number} size - Tamanho da logo em px (largura e altura). Padrão: 74.
 * @param {number} autoPlayDelay - Atraso em ms antes de iniciar a reprodução. Padrão: 3000.
 * @param {boolean} loop - Se deve reproduzir em loop contínuo (para loadings). Padrão: false.
 * @param {object} style - Estilos adicionais para o container.
 */
export default function AnimatedLogo({
    size = 74,
    autoPlayDelay = 3000,
    loop = false,
    style,
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const endTimerRef = useRef(null);

    const player = useVideoPlayer(logoVideoSource, (p) => {
        p.loop = loop;
        p.muted = true;
        p.pause();
    });

    const startPlaying = () => {
        if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
        }

        setIsPlaying(true);
        if (player) {
            try {
                player.currentTime = 0;
                player.play();
            } catch {
                player.replay();
            }
        }

        if (!loop) {
            // A animação dura 2.02s. Ao terminar, retorna para o SVG vetorial
            endTimerRef.current = setTimeout(() => {
                setIsPlaying(false);
            }, 2050);
        }
    };

    useEffect(() => {
        let startTimer = null;
        if (autoPlayDelay > 0) {
            startTimer = setTimeout(() => {
                startPlaying();
            }, autoPlayDelay);
        }

        return () => {
            if (startTimer) clearTimeout(startTimer);
            if (endTimerRef.current) clearTimeout(endTimerRef.current);
        };
    }, [autoPlayDelay]);

    const handlePress = () => {
        startPlaying();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePress}
            style={[
                styles.container,
                { width: size, height: size },
                style,
            ]}
        >
            {/* Logotipo vetorial base sempre visível em repouso */}
            <Logo size={size} color="#080A96" />

            {/* Vídeo animado exibido por cima exclusivamente durante a reprodução */}
            {isPlaying && (
                <View style={StyleSheet.absoluteFill}>
                    <VideoView
                        player={player}
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: 'transparent',
                        }}
                        contentFit="contain"
                        surfaceType="textureView"
                        nativeControls={false}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
