import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './src/screens/WelcomeScreen';
import InterestsScreen from './src/screens/InterestsScreen';
import IdentityScreen from '@/screens/IdentityScreen';
import LanguageScreen from '@/screens/LanguageScreen';
import PurposeScreen from '@/screens/PurposeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Identity: undefined;
  Language: undefined;
  Purpose: undefined;
  Interests: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  // Fontları Yükle
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
  );
}