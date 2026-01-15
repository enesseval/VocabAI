// App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipler
import { RootStackParamList } from './src/types/navigation';

// Context & Utils
import './src/i18n';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { VocabularyProvider } from '@/context/VocabularyContext';

// Ekranlar
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import ReadStoryScreen from '@/screens/ReadStoryScreen';

// 🔥 YENİ: Tab Navigator'ı import ediyoruz
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Merriweather-Bold': require('./src/assets/fonts/Merriweather-Bold.ttf'),
    'Merriweather-Regular': require('./src/assets/fonts/Merriweather-Regular.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
  });

  // Başlangıç rotası tipi güncellendi
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Welcome');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Kullanıcı var mı kontrol et
        const user = await AsyncStorage.getItem('user_persona');
        if (user) {
          // 🔥 Eğer kullanıcı varsa direkt Tab Yapısına (Ana Uygulama) git
          setInitialRoute('MainTabs');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && isReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isReady]);

  if ((!fontsLoaded && !fontError) || !isReady) {
    return null;
  }

  return (
    <OnboardingProvider>
      <VocabularyProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>

                {/* Diğer ekranlar... */}
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />

                {/* 1. YENİ HİKAYE (Normal Açılış) */}
                <Stack.Screen
                  name="ReadStory"
                  component={ReadStoryScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />

                {/* 2. GEÇMİŞ HİKAYE (Bottom Sheet Görünümü) */}
                <Stack.Screen
                  name="StoryModal"
                  component={ReadStoryScreen}
                  options={{
                    presentation: 'transparentModal', // 🔥 Arkası şeffaf
                    animation: 'slide_from_bottom',   // Alttan kayarak gelir
                    headerShown: false,
                  }}
                />

              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </SafeAreaProvider>
      </VocabularyProvider>
    </OnboardingProvider>
  );
}