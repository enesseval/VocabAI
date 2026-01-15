import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme'; // Senin tema dosyan

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 70;
const FLOATING_MARGIN = 20;

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            <View style={styles.barWrapper}>
                {/* GLOW BORDER EFFECT */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.border}
                >
                    {/* GLASS BACKGROUND */}
                    <View style={styles.inner}>
                        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                        <View style={styles.tabRow}>
                            {state.routes.map((route, index) => {
                                const { options } = descriptors[route.key];
                                const isFocused = state.index === index;

                                const onPress = () => {
                                    const event = navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        navigation.navigate(route.name);
                                    }
                                };

                                // İkon render fonksiyonunu çağır
                                const Icon = options.tabBarIcon;

                                return (
                                    <TabButton
                                        key={route.key}
                                        onPress={onPress}
                                        active={isFocused}
                                    >
                                        {Icon && Icon({ focused: isFocused, color: isFocused ? COLORS.primary : '#888', size: 24 })}
                                    </TabButton>
                                );
                            })}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
}

// Animasyonlu Buton
const TabButton = ({ onPress, active, children }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: active ? 1.2 : 1,
            useNativeDriver: true,
            friction: 5
        }).start();
    }, [active]);

    return (
        <TouchableOpacity onPress={onPress} style={styles.tabButton} activeOpacity={0.8}>
            <Animated.View style={{ transform: [{ scale }] }}>
                {children}
                {active && <View style={styles.activeDot} />}
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: FLOATING_MARGIN,
        right: FLOATING_MARGIN,
        alignItems: 'center',
    },
    barWrapper: {
        width: '100%',
        height: BAR_HEIGHT,
        borderRadius: 35,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    border: {
        borderRadius: 35,
        padding: 1, // İnce border efekti
        flex: 1,
    },
    inner: {
        flex: 1,
        borderRadius: 35,
        overflow: 'hidden',
        backgroundColor: 'rgba(20,20,25,0.75)', // Koyu transparan zemin
    },
    tabRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center'
    }
});