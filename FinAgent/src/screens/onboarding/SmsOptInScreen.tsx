import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../app/store';
import { setSmsOptIn, nextStep } from '../../app/store/slices/onboardingSlice';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';

export default function SmsOptInScreen({ navigation }: any) {
  const dispatch = useAppDispatch();

  const handleOptIn = (optIn: boolean) => {
    dispatch(setSmsOptIn(optIn));
    dispatch(nextStep());
    navigation.navigate('Finish');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={80} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Enable SMS Scanning</Text>
        <Text style={styles.subtitle}>
          Let FinAgent automatically track your transactions by scanning bank SMS messages (Demo mode available)
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Automatic transaction detection</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Secure & private processing</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Save time on manual entry</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button title="Enable SMS Scanning" onPress={() => handleOptIn(true)} />
        <Button title="Skip for Now" onPress={() => handleOptIn(false)} variant="outline" style={styles.skipButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  features: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
  },
  buttons: {
    gap: theme.spacing.md,
  },
  skipButton: {
    marginTop: theme.spacing.sm,
  },
});