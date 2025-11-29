import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { addBudget, deleteBudget } from '../../app/store/slices/budgetSlice';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';
import { Budget } from '../../types';

export default function BudgetScreen() {
  const dispatch = useAppDispatch();
  const { budgets, totalBudget, totalSpent } = useAppSelector((state) => state.budget);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const handleAddBudget = () => {
    if (category && limit) {
      const newBudget: Budget = {
        id: `budget_${Date.now()}`,
        category,
        limit: parseFloat(limit),
        spent: 0,
        month: new Date().toISOString().slice(0, 7),
      };
      dispatch(addBudget(newBudget));
      setCategory('');
      setLimit('');
      setModalVisible(false);
    }
  };

  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <View style={styles.container}>
      <AppHeader title="Budget" showAvatar={false} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Budget */}
        <Card style={styles.overallCard}>
          <Text style={styles.overallLabel}>Monthly Budget</Text>
          <Text style={styles.overallAmount}>
            ₹{totalSpent.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(overallPercentage, 100)}%`,
                  backgroundColor:
                    overallPercentage > 100
                      ? theme.colors.danger
                      : overallPercentage > 80
                      ? theme.colors.warning
                      : theme.colors.success,
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>
            {overallPercentage.toFixed(1)}% of budget used
          </Text>
        </Card>

        {/* Add Budget Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Category Budget</Text>
        </TouchableOpacity>

        {/* Budget Categories */}
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            return (
              <Card key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetTitleContainer}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <TouchableOpacity onPress={() => dispatch(deleteBudget(budget.id))}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.budgetAmount}>
                    ₹{budget.spent.toLocaleString('en-IN')} / ₹{budget.limit.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor:
                          percentage > 100
                            ? theme.colors.danger
                            : percentage > 80
                            ? theme.colors.warning
                            : theme.colors.success,
                      },
                    ]}
                  />
                </View>
                <View style={styles.budgetFooter}>
                  <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
                  <Text style={styles.remainingText}>
                    ₹{Math.max(0, budget.limit - budget.spent).toLocaleString('en-IN')} remaining
                  </Text>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No budgets set"
            subtitle="Create category budgets to track your spending"
          />
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Budget</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Food & Dining"
            />
            <TextInput
              label="Monthly Limit"
              value={limit}
              onChangeText={setLimit}
              placeholder="e.g., 5000"
              keyboardType="numeric"
            />

            <Button title="Add Budget" onPress={handleAddBudget} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  overallCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  overallLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  overallAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.dim,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
borderWidth: 1,
borderColor: theme.colors.border,
},
addButtonText: {
fontSize: theme.typography.body.fontSize,
color: theme.colors.primary,
marginLeft: theme.spacing.sm,
fontWeight: '600',
},
budgetCard: {
marginBottom: theme.spacing.sm,
},
budgetHeader: {
marginBottom: theme.spacing.sm,
},
budgetTitleContainer: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: theme.spacing.xs,
},
budgetCategory: {
fontSize: theme.typography.body.fontSize,
fontWeight: '600',
color: theme.colors.textPrimary,
},
budgetAmount: {
fontSize: theme.typography.caption.fontSize,
color: theme.colors.textSecondary,
},
budgetFooter: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
remainingText: {
fontSize: theme.typography.small.fontSize,
color: theme.colors.textSecondary,
},
modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.7)',
justifyContent: 'flex-end',
},
modalContent: {
backgroundColor: theme.colors.surface,
borderTopLeftRadius: theme.borderRadius.xl,
borderTopRightRadius: theme.borderRadius.xl,
padding: theme.spacing.lg,
minHeight: 400,
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
marginBottom: theme.spacing.lg,
},
modalTitle: {
fontSize: theme.typography.h2.fontSize,
fontWeight: theme.typography.h2.fontWeight,
color: theme.colors.textPrimary,
},
});