// src/types/navigation.ts dosyasını aç ve RootStackParamList'i şöyle güncelle:
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  MainTabs: undefined; // <-- YENİ: Tab Navigator için
  ReadStory: undefined; // Parametre almaz, çünkü yeni üretiliyor
  StoryModal: { story: any }; // Parametre alır, çünkü var olanı gösteriyoruz
  // Home: undefined;  <-- Bunu silebilirsin veya kalabilir, ama artık MainTabs kullanacağız
};