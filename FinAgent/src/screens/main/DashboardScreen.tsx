import React from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../app/store';
import AppHeader from '../../components/AppHeader';
import Card from '../../components/Card';
import FAB from '../../components/FAB';
import { theme } from '../../constants/theme';
import { useAppDispatch } from '../../app/store';
import { fetchTransactions } from '../../app/store/thunks/tranasctionThunks';

export default function DashboardScreen({ navigation }: any) {
  const budgets = useAppSelector((state) => state.budget.budgets);
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);

  // useEffect(() => {
  //   // Fetch transactions when component mounts
  //   dispatch(fetchTransactions());
  // }, [dispatch]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <AppHeader
        showAvatar
        showNotification
        onAvatarPress={() => navigation.navigate('Profile')}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={styles.balanceStats}>
            <View style={styles.stat}>
              <Ionicons name="arrow-down-circle" size={20} color={theme.colors.success} />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>₹{totalIncome.toLocaleString('en-IN')}</Text>
              </View>
            </View>
            <View style={styles.stat}>
              <Ionicons name="arrow-up-circle" size={20} color={theme.colors.danger} />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Expense</Text>
                <Text style={styles.statValue}>₹{totalExpense.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="add" size={24} color={theme.colors.textPrimary} />
              </View>
              <Text style={styles.actionLabel}>Add Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CsvUpload')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primaryVariant }]}>
                <Ionicons name="cloud-upload" size={24} color={theme.colors.textPrimary} />
              </View>
              <Text style={styles.actionLabel}>Upload CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('SmsMock')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.success }]}>
                <Ionicons name="mail" size={24} color={theme.colors.textPrimary} />
              </View>
              <Text style={styles.actionLabel}>SMS Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Advisor')}
            >
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.warning }]}>
                <Ionicons name="chatbubbles" size={24} color={theme.colors.textPrimary} />
              </View>
              <Text style={styles.actionLabel}>AI Advisor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Design Reference */}
        <Card style={styles.designCard}>
          <Text style={styles.designTitle}>UI Design Reference</Text>
          <Text style={styles.designSubtitle}>PhonePe-inspired dark theme</Text>
          {/* Placeholder for design image */}
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>
              Design mock: src/assets/images/finagent-ui.png
            </Text>
          </View>
        </Card>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => navigation.navigate('TransactionDetail', { transaction })}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    {
                      backgroundColor:
                        transaction.type === 'income'
                          ? `${theme.colors.success}20`
                          : `${theme.colors.danger}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={transaction.type === 'income' ? theme.colors.success : theme.colors.danger}
                  />
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color:
                        transaction.type === 'income' ? theme.colors.success : theme.colors.danger,
                    },
                  ]}
                >
                  {transaction.type === 'income' ? '+' : '-'}₹
                  {transaction.amount.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </Card>
          )}
        </View>

        {/* Budget Overview */}
        {budgets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {budgets.slice(0, 3).map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              return (
                <Card key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={styles.budgetAmount}>
                      ₹{budget.spent.toLocaleString('en-IN')} / ₹
                      {budget.limit.toLocaleString('en-IN')}
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
                </Card>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB icon="add" onPress={() => navigation.navigate('AddTransaction')} />
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
  balanceCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
  },
  seeAll: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  designCard: {
    marginBottom: theme.spacing.lg,
  },
  designTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  designSubtitle: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: theme.colors.dim,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  budgetCard: {
    marginBottom: theme.spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
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
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.dim,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});