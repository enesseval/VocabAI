import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = {
    onPress: () => void;
    disabled?: boolean;
    text?: string;
    bgColor?: string; // Arkaplan rengi, gradient için (varsayılan: #050406)
};

export default function OnboardingFooter({ onPress, disabled = false, text = 'DEVAM ET', bgColor = '#050406' }: Props) {
    const handlePress = () => {
        if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
        }
    };

    return (
        <View style={styles.footer}>
            {/* Gradient Fade Background */}
            <LinearGradient
                colors={['transparent', bgColor]}
                style={styles.footerGradient}
                pointerEvents="none"
            />

            <TouchableOpacity
                style={[styles.button, disabled && styles.disabledButton]}
                activeOpacity={0.8}
                disabled={disabled}
                onPress={handlePress}
            >
                <Text style={[styles.text, disabled && styles.disabledText]}>
                    {text}
                </Text>

                <View style={[styles.iconCircle, disabled && styles.disabledIconCircle]}>
                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={disabled ? "rgba(255,255,255,0.3)" : "#fff"}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    footerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    button: {
        height: 64,
        backgroundColor: '#000',
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        shadowColor: '#fbbf24', // Altın sarısı gölge
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowOpacity: 0,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        letterSpacing: 1.5,
        fontWeight: 'bold',
    },
    disabledText: {
        color: 'rgba(255,255,255,0.3)',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledIconCircle: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
