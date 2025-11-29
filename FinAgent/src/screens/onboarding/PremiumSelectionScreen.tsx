import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { theme } from '../../constants/theme';
import { completeOnboarding } from '@/app/store/slices/onboardingSlice';
import { useAppDispatch } from '../../app/store';


type PlanType = 'free' | 'premium' | 'smart';
const dispatch = useAppDispatch();
const handleFinish = () => {
    dispatch(completeOnboarding());
  };

const plans = [
  {
    id: 'free' as PlanType,
    name: 'Freemium',
    price: 'Free',
    icon: 'rocket-outline' as const,
    features: ['3 queries/day', 'Basic insights', 'CSV upload', 'Category tagging'],
  },
  {
    id: 'premium' as PlanType,
    name: 'Premium',
    price: '₹299/mo',
    badge: 'POPULAR',
    icon: 'sparkles' as const,
    features: ['Unlimited queries', 'ML predictions', 'Money coaching', 'Goals tracking'],
  },
  {
    id: 'smart' as PlanType,
    name: 'Smart',
    price: '₹599/mo',
    badge: 'BEST',
    icon: 'flash' as const,
    features: ['Everything in Premium', 'AI recommendations', 'Cashback optimizer', 'Investment tips'],
  },
];

export default function PremiumSelectionScreen({ navigation }: any) {
  const [selected, setSelected] = useState<PlanType>('premium');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade anytime. All plans track transactions.</Text>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[styles.card, selected === plan.id && styles.cardSelected]}
            onPress={() => setSelected(plan.id)}
          >
            {plan.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.iconBox}>
                <Ionicons name={plan.icon} size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
              </View>
              <View style={selected === plan.id ? styles.radioOn : styles.radioOff}>
                {selected === plan.id && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </View>

            {plan.features.map((feature, i) => (
              <View key={i} style={styles.feature}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.replace('')}>
          <Text style={styles.skip}>Skip, use Free plan</Text>
        </TouchableOpacity>
        <Button
          title={selected === 'free' ? 'Continue Free' : `Start ${plans.find(p => p.id === selected)?.name}`}
          onPress={handleFinish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.dim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  planPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  radioOn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOff: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  featureText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  skip: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});