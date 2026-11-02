import React from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AvatarPicker({
    imageUri,
    onChangeImage,
    size = 88,
    style,
}) {
    async function handlePickImage() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permissão necessária',
                    'Precisamos de permissão de acesso às fotos para selecionar o logotipo ou imagem de perfil.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onChangeImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar a imagem selecionada.');
        }
    }

    function handlePress() {
        if (imageUri) {
            Alert.alert('Foto selecionada', 'Deseja alterar ou remover a imagem atual?', [
                { text: 'Remover', style: 'destructive', onPress: () => onChangeImage(null) },
                { text: 'Trocar foto', onPress: handlePickImage },
                { text: 'Cancelar', style: 'cancel' },
            ]);
        } else {
            handlePickImage();
        }
    }

    const borderRadius = size / 2;

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                style={[
                    styles.avatarCircle,
                    {
                        width: size,
                        height: size,
                        borderRadius: borderRadius,
                    },
                ]}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={[
                            styles.avatarImage,
                            {
                                width: size,
                                height: size,
                                borderRadius: borderRadius,
                            },
                        ]}
                    />
                ) : (
                    <MaterialIcons name="image" size={size * 0.42} color="#FFFFFF" />
                )}

                {/* Badge indicador no canto inferior */}
                <View style={styles.cameraBadge}>
                    <MaterialIcons
                        name={imageUri ? 'edit' : 'add-a-photo'}
                        size={14}
                        color="#FFFFFF"
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarCircle: {
        backgroundColor: '#7E7E7E',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    avatarImage: {
        resizeMode: 'cover',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#080A96',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#EAEAEA',
        elevation: 4,
    },
});

