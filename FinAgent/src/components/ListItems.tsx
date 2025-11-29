import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface ListItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  amount?: number;
  amountColor?: string;
  onPress?: () => void;
}

export default function ListItem({
  icon,
  iconColor = theme.colors.textPrimary,
  iconBgColor = theme.colors.dim,
  title,
  subtitle,
  amount,
  amountColor = theme.colors.textPrimary,
  onPress,
}: ListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {amount !== undefined && (
        <Text style={[styles.amount, { color: amountColor }]}>
          {amount >= 0 ? '+' : ''}₹{Math.abs(amount).toLocaleString('en-IN')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  amount: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
  },
});