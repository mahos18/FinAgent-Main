import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface AppHeaderProps {
  title?: string;
  showAvatar?: boolean;
  showNotification?: boolean;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
}

export default function AppHeader({
  title,
  showAvatar = true,
  showNotification = true,
  onAvatarPress,
  onNotificationPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : (
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>FinAgent</Text>
        </View>
      )}
      <View style={styles.actions}>
        {showNotification && (
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        )}
        {showAvatar && (
          <TouchableOpacity style={styles.avatar} onPress={onAvatarPress} accessibilityLabel="Profile">
            <Ionicons name="person" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.textPrimary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:theme.spacing.md,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:theme.spacing.md,
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
    position: 'relative',
    },
    badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    },
    avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    },
    });