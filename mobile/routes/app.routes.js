import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/app/DashboardScreen';
import ClientDetailScreen from '../screens/app/ClientDetailScreen';
import ClientFormScreen from '../screens/app/ClientFormScreen';
import ClientsListScreen from '../screens/app/ClientsListScreen';
import AiChatScreen from '../screens/app/AiChatScreen';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
    return (
        <Stack.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerStyle: { backgroundColor: '#1E293B' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
        
            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Painel Comercial' }}
            />
            <Stack.Screen
                name="ClientsList"
                component={ClientsListScreen}
                options={{ title: 'Clientes' }}
            />
            <Stack.Screen
                name="ClientForm"
                component={ClientFormScreen}
                options={{ title: 'Novo / Editar Cliente' }}
            />
            <Stack.Screen
                name="ClientDetail"
                component={ClientDetailScreen}
                options={{ title: 'Detalhes da Oportunidade' }}
            />
            <Stack.Screen
                name="AiChat"
                component={AiChatScreen}
                options={{ title: 'Assistente Comercial IA' }}
            />
        </Stack.Navigator>
    );
}