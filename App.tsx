import React, { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Native Splash'in otomatik kapanmasını engelle (Fontlar yüklenene kadar)
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
})

export default function App() {
  // 1. Sadece Fontları Yükle (Başka bir şey bekleme)
  const [fontsLoaded, fontError] = useFonts({
    'Merriweather-Bold': require('./src/assets/fonts/Merriweather-Bold.ttf'),
    'Merriweather-Regular': require('./src/assets/fonts/Merriweather-Regular.ttf'),
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
  });

  // 2. Fontlar yüklenir yüklenmez Native Splash'i GİZLE
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
      <VocabularyProvider>
        <SafeAreaProvider>
          {/* Layout yüklendiği an Native Splash gidecek, alttaki WelcomeScreen görünecek */}
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <NavigationContainer>
              {/* initialRouteName her zaman 'Welcome' olsun ki animasyonu görelim */}
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">

                {/* Bu ekran artık bizim "Custom Splash" ekranımız */}
                <Stack.Screen name="Welcome" component={WelcomeScreen} />

                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="MainTabs" component={TabNavigator} />

                <Stack.Screen
                  name="ReadStory"
                  component={ReadStoryScreen}
                  options={{ animation: 'slide_from_bottom' }}
                />

                <Stack.Screen
                  name="StoryModal"
                  component={ReadStoryScreen}
                  options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
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