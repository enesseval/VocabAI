import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next'; // Dil desteği

import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS, SIZES } from '../constants/theme'; // Merkezi Tema

// --- HAREKETLİ TOZ ZERRESİ ---
// Renkleri global temadan alalım ki tutarlı olsun
const PARTICLE_COLORS = [
    '#FFFFFF',
    '#52525b',
    COLORS.primary // Gold rengi temadan
];

const FloatingParticle = ({ initialTop, left, size, color }: { initialTop: number, left: number, size: number, color: string }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Theme rengiyle kontrol ediyoruz
    const isGold = color === COLORS.primary;

    useEffect(() => {
        const duration = 20000 + Math.random() * 20000;
        Animated.loop(
            Animated.timing(floatAnim, {
                toValue: 1,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: isGold ? 0.7 : 0.3,
                    duration: isGold ? 2000 : 3000,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.1,
                    duration: isGold ? 2000 : 3000,
                    useNativeDriver: true
                }),
            ])
        ).start();
    }, []);

    const translateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -SIZES.height - 100],
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: left,
                    top: initialTop,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    opacity: opacityAnim,
                    transform: [{ translateY }],
                    shadowColor: isGold ? COLORS.primary : 'transparent',
                    shadowOpacity: isGold ? 1 : 0,
                    shadowRadius: isGold ? 4 : 0,
                },
            ]}
        />
    );
};

export default function WelcomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    const particles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * SIZES.width,
        initialTop: Math.random() * SIZES.height * 1.5,
        size: Math.random() * 2.5 + 0.5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* BACKGROUND */}
            <LinearGradient
                colors={['#1e1b4b', '#020203', '#000']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* PARTICLES */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {particles.map((p) => (
                    <FloatingParticle key={p.id} {...p} />
                ))}
            </View>

            <SafeAreaView style={styles.safeArea}>

                {/* --- ORTA KISIM --- */}
                <View style={styles.centerContent}>
                    <View style={styles.logoStage}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.title}>{t('onboarding.welcome.appName')}</Text>

                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
                            style={styles.verticalLine}
                        />

                        <Text style={styles.subtitle}>
                            {t('onboarding.welcome.sloganPart1')} <Text style={styles.italicText}>{t('onboarding.welcome.sloganItalic')}</Text> {t('onboarding.welcome.sloganPart2')}
                        </Text>
                    </View>
                </View>

                {/* --- ALT KISIM --- */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.outlineButtonWrapper}
                        onPress={() => navigation.navigate('Identity')}
                    >
                        <View style={styles.buttonGlowEffect} />

                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'transparent', 'rgba(255,255,255,0.1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.outlineGradient}
                        >
                            <Text style={styles.buttonText}>{t('onboarding.welcome.start')}</Text>

                            <View style={styles.absoluteIcon}>
                                <Text style={styles.arrowIcon}>→</Text>
                            </View>
                        </LinearGradient>

                        <LinearGradient
                            colors={['transparent', '#fff', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.techLineTop}
                        />
                        <LinearGradient
                            colors={['transparent', '#fff', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.techLineBottom}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginBtn}>
                        <Text style={styles.loginText}>
                            {t('onboarding.welcome.haveAccount')} <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('onboarding.welcome.login')}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    particle: {
        position: 'absolute',
        borderRadius: 999,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    logoStage: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        width: SIZES.width * 0.6,
        height: SIZES.width * 0.6,
        position: 'relative',
    },
    logo: {
        width: '100%',
        height: '100%',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    textWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 48,
        color: COLORS.text,
        // DİKKAT: App.tsx'te Merriweather-Bold yüklü, o yüzden onu kullanıyoruz.
        // Playfair istiyorsan ayrıca yüklememiz gerek.
        fontFamily: FONTS.bold,
        letterSpacing: 2,
        textAlign: 'center',
        textShadowColor: 'rgba(124, 58, 237, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    verticalLine: {
        width: 1.5,
        height: 60,
        marginVertical: 12,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    italicText: {
        // App.tsx'te tanımladığımız Italics stili varsa onu kullanırız
        // Yoksa FONTS.titleItalic (Merriweather-Bold)
        fontFamily: FONTS.titleItalic,
        fontStyle: 'italic', // Font destekliyorsa
        color: '#fff',
        textTransform: 'lowercase',
        fontSize: 14,
    },
    bottomSection: {
        paddingHorizontal: 40,
        paddingBottom: 50,
        alignItems: 'center',
        gap: 24,
    },
    outlineButtonWrapper: {
        width: '100%',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonGlowEffect: {
        position: 'absolute',
        width: '80%',
        height: 20,
        backgroundColor: 'transparent',
        opacity: 0.3,
        top: 22,
    },
    outlineGradient: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    techLineTop: {
        position: 'absolute',
        top: 0,
        width: '50%',
        height: 2,
        shadowColor: '#fff',
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    techLineBottom: {
        position: 'absolute',
        bottom: 0,
        width: '50%',
        height: 2,
        shadowColor: '#fff',
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.semiBold,
        letterSpacing: 6,
        fontWeight: '600',
        textAlign: 'center',
    },
    absoluteIcon: {
        position: 'absolute',
        right: 24,
    },
    arrowIcon: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '300',
        textShadowColor: '#fff',
        textShadowRadius: 5,
    },
    loginBtn: {
        padding: 5,
    },
    loginText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontFamily: FONTS.semiBold,
        letterSpacing: 1.5,
    },
});