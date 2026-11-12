import { Platform } from 'react-native';

/**
 * Famílias tipográficas centralizadas do aplicativo.
 * As fontes Inter são carregadas na raiz (App.js), eliminando chamadas
 * redundantes de `useFonts` em componentes individuais.
 */
export const FONTS = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

export default FONTS;
