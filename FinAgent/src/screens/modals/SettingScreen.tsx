import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { theme } from '../../constants/theme';

export default function SettingsScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>General</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name="moon" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.menuItemText}>Dark Mode</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>On</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name="language" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.menuItemText}>Language</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>English</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name="cash" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.menuItemText}>Currency</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemValue}>INR (₹)</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Data & Privacy</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name="cloud-download" size={20} color={theme.colors.textPrimary} />
            </View>
            <Text style={styles.menuItemText}>Export Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Ionicons name="trash" size={20} color={theme.colors.danger} />
            </View>
            <Text style={[styles.menuItemText, { color: theme.colors.danger }]}>Clear All Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.aboutCard}>
      <Text style={styles.aboutLabel}>Version</Text>
      <Text style={styles.aboutValue}>1.0.0</Text>
      <Text style={styles.aboutLabel}>Build</Text>
      <Text style={styles.aboutValue}>2025.11.25</Text>
    </Card>

    <View style={{ height: 50 }} />
  </ScrollView>
</View>
  );
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: theme.colors.background,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
padding: theme.spacing.md,
borderBottomWidth: 1,
borderBottomColor: theme.colors.border,
},
title: {
fontSize: theme.typography.h2.fontSize,
fontWeight: theme.typography.h2.fontWeight,
color: theme.colors.textPrimary,
},
content: {
flex: 1,
padding: theme.spacing.lg,
},
sectionTitle: {
fontSize: theme.typography.caption.fontSize,
fontWeight: '700',
color: theme.colors.textSecondary,
textTransform: 'uppercase',
marginTop: theme.spacing.lg,
marginBottom: theme.spacing.md,
letterSpacing: 1,
},
menuItem: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
backgroundColor: theme.colors.surface,
borderRadius: theme.borderRadius.md,
padding: theme.spacing.md,
marginBottom: theme.spacing.sm,
borderWidth: 1,
borderColor: theme.colors.border,
},
menuItemLeft: {
flexDirection: 'row',
alignItems: 'center',
flex: 1,
},
menuIcon: {
width: 36,
height: 36,
borderRadius: 18,
backgroundColor: theme.colors.dim,
justifyContent: 'center',
alignItems: 'center',
marginRight: theme.spacing.md,
},
menuItemText: {
fontSize: theme.typography.body.fontSize,
color: theme.colors.textPrimary,
},
menuItemRight: {
flexDirection: 'row',
alignItems: 'center',
},
menuItemValue: {
fontSize: theme.typography.body.fontSize,
color: theme.colors.textSecondary,
marginRight: theme.spacing.sm,
},
aboutCard: {
marginTop: theme.spacing.md,
},
aboutLabel: {
fontSize: theme.typography.small.fontSize,
color: theme.colors.textSecondary,
marginBottom: 4,
},
aboutValue: {
fontSize: theme.typography.body.fontSize,
fontWeight: '600',
color: theme.colors.textPrimary,
marginBottom: theme.spacing.md,
},
});
