import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList, AppStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';
import TabNavigator from './TabNavigator';

// Her iki stack de ayrı instance — token değişince React bunları
// farklı component ağacı olarak algılar ve tam olarak yeniden mount eder.
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();


export default function AppNavigator() {
  const { isLoading, token } = useAuth();
  const { colors } = useTheme();

  const sharedScreenOptions = {
    headerTitleStyle: { fontFamily: 'Manrope_700Bold' as const },
    headerStyle: { backgroundColor: colors.card },
    headerTintColor: colors.textPrimary,
    headerShadowVisible: false,
  };

  // Uygulama açılışında AsyncStorage'dan token kontrol edilirken loading göster
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#5c642a" size="large" />
      </View>
    );
  }

  // Giriş yapılmamış → Auth stack (Login / Register)
  if (!token) {
    return (
      <AuthStack.Navigator
        initialRouteName="Login"
        screenOptions={sharedScreenOptions}
      >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  // Giriş yapılmış → App stack
  // MainTabs  : Tab navigator (Tickets / Profile / AI) — tam ekran, header yok
  // TicketDetail / CreateTicket: Tab bar'ın üzerinde açılan stack sayfaları
  return (
    <AppStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={sharedScreenOptions}
    >
      <AppStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="TicketDetail"
        component={TicketDetailScreen}
        options={{ title: 'Talep Detayı' }}
      />
      <AppStack.Screen
        name="CreateTicket"
        component={CreateTicketScreen}
        options={{ title: 'Yeni Talep' }}
      />
    </AppStack.Navigator>
  );
}
