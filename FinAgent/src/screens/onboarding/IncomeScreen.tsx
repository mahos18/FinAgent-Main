import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../app/store';
import { setOccupation, setMonthlyIncome, nextStep } from '../../app/store/slices/onboardingSlice';
import { updateUserProfile } from '../../app/store/thunks/authThunks';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { theme } from '../../constants/theme';
import { unwrapResult } from '@reduxjs/toolkit';


type OccupationType = 'employed' | 'freelancer' | 'student' | 'other';

interface OccupationOption {
  type: OccupationType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  incomeLabel: string;
  incomePlaceholder: string;
}

const occupations: OccupationOption[] = [
  {
    type: 'employed',
    icon: 'briefcase',
    title: 'Employed',
    subtitle: 'Working full-time or part-time',
    incomeLabel: 'Monthly Salary',
    incomePlaceholder: 'e.g., 50000',
  },
  {
    type: 'freelancer',
    icon: 'laptop',
    title: 'Freelancer',
    subtitle: 'Self-employed or contractor',
    incomeLabel: 'Average Monthly Income',
    incomePlaceholder: 'e.g., 35000',
  },
  {
    type: 'student',
    icon: 'school',
    title: 'Student',
    subtitle: 'Currently studying',
    incomeLabel: 'Monthly Earnings/Savings',
    incomePlaceholder: 'e.g., 10000',
  },
  {
    type: 'other',
    icon: 'ellipsis-horizontal',
    title: 'Other',
    subtitle: 'Retired, homemaker, etc.',
    incomeLabel: 'Monthly Income',
    incomePlaceholder: 'e.g., 25000',
  },
];

export default function IncomeScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationType | null>(null);
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedOption = occupations.find((o) => o.type === selectedOccupation);

  const handleContinue = async () => {
  if (!selectedOccupation) {
    setError('Please select your occupation');
    return;
  }

  if (!income || parseFloat(income) <= 0) {
    setError('Please enter a valid income amount');
    return;
  }

  const incomeAmount = parseFloat(income);

  // Save to Redux
  dispatch(setOccupation(selectedOccupation));
  dispatch(setMonthlyIncome(incomeAmount));

  // Save to backend
  setSaving(true);
try {
  const resultAction = await dispatch(
    updateUserProfile({
      occupation: selectedOccupation,
      monthlyIncome: incomeAmount,
    })
  );
  
  if (updateUserProfile.fulfilled.match(resultAction)) {
    // Success
    console.log('Profile updated successfully');
  } else {
    // Failed but continue anyway
    console.error('Failed to update profile, continuing anyway');
  }
} catch (error) {
  console.error('Failed to update profile:', error);
  // Continue anyway, can retry later
} finally {
  setSaving(false);
  dispatch(nextStep());
  navigation.navigate('SmsOptIn');
}

  dispatch(nextStep());
  navigation.navigate('SmsOptIn');
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>This helps us provide better financial insights</Text>
        </View>

        {/* Occupation Selection */}
        <Text style={styles.sectionTitle}>What's your occupation?</Text>
        <View style={styles.occupationsGrid}>
          {occupations.map((occupation) => (
            <TouchableOpacity
              key={occupation.type}
              style={[
                styles.occupationCard,
                selectedOccupation === occupation.type && styles.occupationCardActive,
              ]}
              onPress={() => {
                setSelectedOccupation(occupation.type);
                setError('');
              }}
            >
              <View
                style={[
                  styles.occupationIcon,
                  selectedOccupation === occupation.type && styles.occupationIconActive,
                ]}
              >
                <Ionicons
                  name={occupation.icon}
                  size={28}
                  color={
                    selectedOccupation === occupation.type ? theme.colors.primary : theme.colors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.occupationTitle,
                  selectedOccupation === occupation.type && styles.occupationTitleActive,
                ]}
              >
                {occupation.title}
              </Text>
              <Text style={styles.occupationSubtitle}>{occupation.subtitle}</Text>
              {selectedOccupation === occupation.type && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Income Input - Shows only when occupation is selected */}
        {selectedOption && (
          <View style={styles.incomeSection}>
            <Text style={styles.sectionTitle}>{selectedOption.incomeLabel}</Text>
            <View style={styles.incomeInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                value={income}
                onChangeText={(text) => {
                  setIncome(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                placeholder={selectedOption.incomePlaceholder}
                keyboardType="numeric"
                style={styles.incomeInput}
              />
            </View>
            {income && parseFloat(income) > 0 && (
              <Text style={styles.incomeHint}>
                ≈ ₹{(parseFloat(income) / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })} per year
              </Text>
            )}
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            Your financial information is encrypted and secure. We use it only to provide personalized insights.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!selectedOccupation || !income} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  titleContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  occupationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  occupationCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  occupationCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  occupationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.dim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  occupationIconActive: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  occupationTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  occupationTitleActive: {
    color: theme.colors.primary,
  },
  occupationSubtitle: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  checkmark: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  incomeSection: {
    marginBottom: theme.spacing.xl,
  },
  incomeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  incomeInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  incomeHint: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
    lineHeight: 20,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});