import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../app/store';
import { addManyTransactions, setLoading } from '../../app/store/slices/transactionsSlice';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { theme } from '../../constants/theme';
import { Transaction } from '../../types';

const mockCsvData = [
  ['Date', 'Merchant', 'Amount', 'Type', 'Category'],
  ['2025-11-20', 'Starbucks', '250', 'expense', 'Food & Dining'],
  ['2025-11-19', 'Salary', '50000', 'income', 'Income'],
  ['2025-11-18', 'Amazon', '1200', 'expense', 'Shopping'],
  ['2025-11-17', 'Uber', '350', 'expense', 'Transport'],
];

export default function CsvUploadScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const [csvSelected, setCsvSelected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePickCsv = () => {
    // Simulate file picker
    setTimeout(() => {
      setCsvSelected(true);
    }, 500);
  };

  const handleStartImport = () => {
    setUploading(true);
    dispatch(setLoading(true));

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate parsing and creating transactions
    setTimeout(() => {
      const transactions: Transaction[] = mockCsvData.slice(1).map((row, index) => ({
        id: `csv_${Date.now()}_${index}`,
        date: row[0],
        merchant: row[1],
        amount: parseFloat(row[2]),
        type: row[3] as 'income' | 'expense',
        category: row[4],
        source: 'csv',
      }));

      dispatch(addManyTransactions(transactions));
      dispatch(setLoading(false));
      setUploading(false);
      setProgress(0);

      Alert.alert('Success', `${transactions.length} transactions imported successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Upload CSV</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.infoTitle}>CSV Format Requirements</Text>
          <Text style={styles.infoText}>
            Your CSV should have columns: Date, Merchant, Amount, Type, Category
          </Text>
        </Card>

        {!csvSelected ? (
          <TouchableOpacity style={styles.uploadArea} onPress={handlePickCsv}>
            <Ionicons name="cloud-upload-outline" size={64} color={theme.colors.primary} />
            <Text style={styles.uploadTitle}>Choose CSV File</Text>
            <Text style={styles.uploadSubtitle}>Tap to browse your files</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Card style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={40} color={theme.colors.success} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>transactions.csv</Text>
                  <Text style={styles.fileSize}>2.4 KB • 4 transactions</Text>
                </View>
                {!uploading && (
                  <TouchableOpacity onPress={() => setCsvSelected(false)}>
                    <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </Card>

            {/* Preview Table */}
            <Text style={styles.previewTitle}>Preview</Text>
            <Card style={styles.previewCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  {/* Header */}
                  <View style={styles.tableRow}>
                    {mockCsvData[0].map((header, index) => (
                      <View key={index} style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>{header}</Text>
                      </View>
                    ))}
                  </View>
                  {/* Rows */}
                  {mockCsvData.slice(1).map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.tableRow}>
                      {row.map((cell, cellIndex) => (
                        <View key={cellIndex} style={styles.tableCell}>
                          <Text style={styles.tableCellText}>{cell}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Card>

            {uploading && (
              <Card style={styles.progressCard}>
                <Text style={styles.progressTitle}>Importing transactions...</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}%</Text>
              </Card>
            )}

            <Button
              title="Start Import"
              onPress={handleStartImport}
              loading={uploading}
              disabled={uploading}
              style={styles.importButton}
            />
          </>
        )}
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
  infoTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    flex: 1,
  },
  infoText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  uploadArea: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  uploadTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  uploadSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  fileCard: {
    marginBottom: theme.spacing.lg,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  fileName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  previewTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  previewCard: {
    marginBottom: theme.spacing.lg,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableHeader: {
    width: 120,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.dim,
  },
  tableHeaderText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  tableCell: {
    width: 120,
    padding: theme.spacing.sm,
  },
  tableCellText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textPrimary,
  },
  progressCard: {
    marginBottom: theme.spacing.lg,
  },
  progressTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.dim,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  importButton: {
    marginTop: theme.spacing.md,
  },
});