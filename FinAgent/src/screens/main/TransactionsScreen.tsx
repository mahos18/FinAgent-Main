import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { setFilter, setSearchQuery } from '../../app/store/slices/transactionsSlice';
import AppHeader from '../../components/AppHeader';
import TextInput from '../../components/TextInput';
import FAB from '../../components/FAB';
import EmptyState from '../../components/EmptyState';
import { theme } from '../../constants/theme';

export default function TransactionsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { items, filter, searchQuery } = useAppSelector((state) => state.transactions);

  const filteredTransactions = items.filter((transaction) => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch =
      searchQuery === '' ||
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <AppHeader title="Transactions" showAvatar={false} />

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => dispatch(setSearchQuery(text))}
            placeholder="Search transactions..."
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => dispatch(setFilter('all'))}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'income' && styles.filterChipActive]}
            onPress={() => dispatch(setFilter('income'))}
          >
            <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'expense' && styles.filterChipActive]}
            onPress={() => dispatch(setFilter('expense'))}
          >
            <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
              >
                <View
                  style={[
                    styles.icon,
                    {
                      backgroundColor:
                        item.type === 'income'
                          ? `${theme.colors.success}20`
                          : `${theme.colors.danger}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={24}
                    color={item.type === 'income' ? theme.colors.success : theme.colors.danger}
                  />
                </View>
                <View style={styles.details}>
                  <Text style={styles.merchant}>{item.merchant}</Text>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.amount,
                      { color: item.type === 'income' ? theme.colors.success : theme.colors.danger },
                    ]}
                  >
                    {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceText}>{item.source}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No transactions found"
            subtitle="Try adjusting your search or filters"
          />
        )}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 100,
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
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  details: {
    flex: 1,
  },
  merchant: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  sourceBadge: {
    backgroundColor: theme.colors.dim,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  sourceText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
});