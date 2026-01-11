// App.tsx
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tipleri yeni dosyadan çekiyoruz
import { RootStackParamList } from './src/types/navigation';

import './src/i18n';
import { OnboardingProvider } from './src/context/OnboardingContext';

// Importları standart hale getirelim
import WelcomeScreen from './src/screens/WelcomeScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import PurposeScreen from './src/screens/PurposeScreen';
import InterestsScreen from './src/screens/InterestsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Merriweather-Bold': require('./src/assets/fonts/Merriweather-Bold.ttf'),
    'Merriweather-Regular': require('./src/assets/fonts/Merriweather-Regular.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <OnboardingProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Identity" component={IdentityScreen} />
              <Stack.Screen name="Language" component={LanguageScreen} />
              <Stack.Screen name="Purpose" component={PurposeScreen} />
              <Stack.Screen name="Interests" component={InterestsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </OnboardingProvider>
  );
}