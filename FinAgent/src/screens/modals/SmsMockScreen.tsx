import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../app/store';
import { addManyTransactions } from '../../app/store/slices/transactionsSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { theme } from '../../constants/theme';
import { mockSmsData, parseSmsToTransaction } from '../../services/mockSms';

export default function SmsMockScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [autoScan, setAutoScan] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoScan) {
      interval = setInterval(() => {
        // Simulate receiving a new SMS
        const randomSms = mockSmsData[Math.floor(Math.random() * mockSmsData.length)];
        const transaction = parseSmsToTransaction(randomSms);
        dispatch(addManyTransactions([transaction]));
      }, 8000); // Every 8 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScan, dispatch]);

  const handleScanSms = () => {
    setScanning(true);
    setTimeout(() => {
      const transactions = mockSmsData.map(parseSmsToTransaction);
      dispatch(addManyTransactions(transactions));
      setScanning(false);
      Alert.alert('Success', `${transactions.length} transactions extracted from SMS messages`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>SMS Demo</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Demo Mode</Text>
            <Text style={styles.infoText}>
              This is a simulated SMS scanner. In production, this would read real bank SMS messages
              with proper permissions.
            </Text>
          </View>
        </Card>

        {/* Auto Scan Toggle */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="sync" size={24} color={theme.colors.textPrimary} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Auto Scan</Text>
                <Text style={styles.toggleSubtitle}>Simulate incoming SMS messages</Text>
              </View>
            </View>
            <Switch
              value={autoScan}
              onValueChange={setAutoScan}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.textPrimary}
            />
          </View>
        </Card>

        {/* Mock SMS List */}
        <Text style={styles.sectionTitle}>Sample SMS Messages ({mockSmsData.length})</Text>
        {mockSmsData.map((sms) => (
          <Card key={sms.id} style={styles.smsCard}>
            <View style={styles.smsHeader}>
              <Text style={styles.smsSender}>{sms.sender}</Text>
              <Text style={styles.smsTime}>
                {new Date(sms.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={styles.smsMessage}>{sms.message}</Text>
          </Card>
        ))}

        <Button
          title="Scan All SMS"
          onPress={handleScanSms}
          loading={scanning}
          disabled={scanning}
          style={styles.scanButton}
        />

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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  toggleCard: {
    marginBottom: theme.spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  toggleTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  smsCard: {
    marginBottom: theme.spacing.sm,
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  smsSender: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  smsTime: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  smsMessage: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  scanButton: {
    marginTop: theme.spacing.lg,
  },
});