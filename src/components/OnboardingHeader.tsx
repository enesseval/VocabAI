import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

type Props = {
    currentStep: number;
    totalSteps?: number;
    onBack?: () => void;
};

const COLORS = {
    primary: '#fbbf24',
};

export default function OnboardingHeader({ currentStep, totalSteps = 4, onBack }: Props) {
    const navigation = useNavigation();

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.progressBarContainer}>
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isActive = stepNum === currentStep;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.progressStep,
                                isActive && styles.activeStep
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    progressBarContainer: {
        flexDirection: 'row',
        gap: 6
    },
    progressStep: {
        width: 12,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    activeStep: {
        backgroundColor: COLORS.primary,
        width: 26
    }
});
