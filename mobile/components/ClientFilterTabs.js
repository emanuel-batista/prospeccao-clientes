import React from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import {
    useFonts,
    Inter_600SemiBold,
    Inter_500Medium,
} from '@expo-google-fonts/inter';

/**
 * ClientFilterTabs
 * Barra horizontal de filtros rápidos por estágio do funil e potencial comercial.
 */
export default function ClientFilterTabs({
    tabs,
    activeTab,
    onSelectTab,
    counts = {},
    style,
}) {
    const [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_500Medium,
    });

    const fontSemiBold = fontsLoaded
        ? 'Inter_600SemiBold'
        : Platform.select({ ios: 'System', android: 'sans-serif-medium' });
    const fontMedium = fontsLoaded
        ? 'Inter_500Medium'
        : Platform.select({ ios: 'System', android: 'sans-serif' });

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.container, style]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = counts[tab.id];

                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onSelectTab(tab.id)}
                        activeOpacity={0.8}
                        style={[
                            styles.tabItem,
                            isActive ? styles.tabItemActive : styles.tabItemInactive,
                        ]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}>
                        <Text
                            style={[
                                styles.tabLabel,
                                { fontFamily: isActive ? fontSemiBold : fontMedium },
                                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                            ]}>
                            {tab.label}
                        </Text>

                        {typeof count === 'number' && (
                            <View
                                style={[
                                    styles.countBadge,
                                    isActive
                                        ? styles.countBadgeActive
                                        : styles.countBadgeInactive,
                                ]}>
                                <Text
                                    style={[
                                        styles.countText,
                                        { fontFamily: fontSemiBold },
                                        isActive
                                            ? styles.countTextActive
                                            : styles.countTextInactive,
                                    ]}>
                                    {count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    tabItemActive: {
        backgroundColor: '#080A96',
        borderColor: '#080A96',
    },
    tabItemInactive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
    },
    tabLabel: {
        fontSize: 13,
        letterSpacing: -0.1,
    },
    tabLabelActive: {
        color: '#FFFFFF',
    },
    tabLabelInactive: {
        color: '#475569',
    },
    countBadge: {
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadgeActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
    },
    countBadgeInactive: {
        backgroundColor: '#F1F5F9',
    },
    countText: {
        fontSize: 11,
    },
    countTextActive: {
        color: '#FFFFFF',
    },
    countTextInactive: {
        color: '#64748B',
    },
});

