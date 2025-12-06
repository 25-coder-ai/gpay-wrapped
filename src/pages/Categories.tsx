import { useMemo, useState } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useNavigate } from 'react-router-dom';
import { convertToINR, TransactionCategory, categorizeTransaction } from '../utils/categoryUtils';
import { filterTransactionsByYear, filterActivitiesByYear } from '../utils/dateUtils';
import { Currency } from '../types/data.types';
import styles from './Categories.module.css';

interface TransactionItem {
  description: string;
  amount: Currency;
  date: Date;
  source: 'transaction' | 'activity';
}

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  Food: '#FF6B6B',
  Groceries: '#4ECDC4',
  Clothing: '#A855F7',
  Entertainment: '#F97316',
  'E-commerce': '#3B82F6',
  'Travel & Transport': '#10B981',
  'Utilities & Bills': '#6366F1',
  Healthcare: '#EC4899',
  Education: '#14B8A6',
  Investments: '#22C55E',
  Transfers: '#8B5CF6',
  'Bank Transfers': '#0EA5E9',
  Others: '#94A3B8',
};

const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  Food: '🍕',
  Groceries: '🛒',
  Clothing: '👕',
  Entertainment: '🎬',
  'E-commerce': '🛍️',
  'Travel & Transport': '🚗',
  'Utilities & Bills': '💡',
  Healthcare: '🏥',
  Education: '📚',
  Investments: '📈',
  Transfers: '💸',
  'Bank Transfers': '🏦',
  Others: '📦',
};

export default function Categories() {
  const navigate = useNavigate();
  const { parsedData, selectedYear } = useDataStore();
  const [expandedCategory, setExpandedCategory] = useState<TransactionCategory | null>(null);

  // Get all items with their category
  const allItemsWithCategory = useMemo(() => {
    if (!parsedData) return [];

    const filteredTransactions = filterTransactionsByYear(parsedData.transactions, selectedYear);
    const filteredActivities = filterActivitiesByYear(parsedData.activities, selectedYear);

    const items: (TransactionItem & { category: TransactionCategory })[] = [
      ...filteredTransactions.map(t => ({
        description: t.description,
        amount: t.amount,
        date: t.time,
        source: 'transaction' as const,
        category: categorizeTransaction(t.description),
      })),
      ...filteredActivities
        .filter(a => a.amount && (a.transactionType === 'sent' || a.transactionType === 'paid'))
        .map(a => ({
          description: a.title,
          amount: a.amount!,
          date: a.time,
          source: 'activity' as const,
          category: categorizeTransaction(a.title),
        })),
    ];

    return items;
  }, [parsedData, selectedYear]);

  const categoryData = useMemo(() => {
    if (allItemsWithCategory.length === 0) return [];

    // Group by category
    const categoryMap = new Map<TransactionCategory, { total: number; count: number }>();

    allItemsWithCategory.forEach(item => {
      const existing = categoryMap.get(item.category) || { total: 0, count: 0 };
      existing.total += convertToINR(item.amount);
      existing.count++;
      categoryMap.set(item.category, existing);
    });

    const grandTotal = allItemsWithCategory.reduce(
      (sum, item) => sum + convertToINR(item.amount),
      0
    );

    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        amount: stats.total,
        count: stats.count,
        percentage: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [allItemsWithCategory]);

  // Get transactions for a specific category
  const getTransactionsForCategory = (category: TransactionCategory) => {
    return allItemsWithCategory
      .filter(item => item.category === category)
      .sort((a, b) => convertToINR(b.amount) - convertToINR(a.amount));
  };

  const totalSpent = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  }, [categoryData]);

  if (!parsedData) {
    navigate('/');
    return null;
  }

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${Math.round(amount).toLocaleString()}`;
  };

  return (
    <div className={styles.categories}>
      <div className={styles.container}>
        <button onClick={() => navigate('/story')} className={styles.backLink}>
          ← Back to Summary
        </button>

        <h1 className={styles.title}>
          Spending Categories
          <span className={styles.yearBadge}>
            {selectedYear === 'all' ? 'All Time' : selectedYear}
          </span>
        </h1>

        <div className={styles.totalCard}>
          <div className={styles.totalAmount}>{formatAmount(totalSpent)}</div>
          <div className={styles.totalLabel}>Total Spent</div>
        </div>

        <div className={styles.categoryList}>
          {categoryData.map((item, index) => {
            const isExpanded = expandedCategory === item.category;
            const transactions = isExpanded ? getTransactionsForCategory(item.category) : [];

            return (
              <div
                key={item.category}
                className={`${styles.categoryCard} ${isExpanded ? styles.expanded : ''}`}
                style={{
                  '--category-color': CATEGORY_COLORS[item.category],
                  animationDelay: `${index * 0.1}s`,
                } as React.CSSProperties}
              >
                <div
                  className={styles.categoryHeader}
                  onClick={() => setExpandedCategory(isExpanded ? null : item.category)}
                >
                  <span className={styles.categoryIcon}>
                    {CATEGORY_ICONS[item.category]}
                  </span>
                  <span className={styles.categoryName}>{item.category}</span>
                  <span className={styles.categoryPercentage}>
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className={styles.expandIcon}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBar}
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[item.category],
                    }}
                  />
                </div>

                <div className={styles.categoryDetails}>
                  <span className={styles.categoryAmount}>
                    {formatAmount(item.amount)}
                  </span>
                  <span className={styles.categoryCount}>
                    {item.count} transaction{item.count !== 1 ? 's' : ''} • Tap to {isExpanded ? 'collapse' : 'expand'}
                  </span>
                </div>

                {isExpanded && (
                  <div className={styles.transactionList}>
                    <div className={styles.transactionListHeader}>
                      <span>Transaction Details</span>
                      <span>{transactions.length} items</span>
                    </div>
                    {transactions.slice(0, 50).map((txn, txnIndex) => (
                      <div key={txnIndex} className={styles.transactionItem}>
                        <div className={styles.transactionInfo}>
                          <span className={styles.transactionDesc}>
                            {txn.description.length > 40
                              ? txn.description.substring(0, 40) + '...'
                              : txn.description}
                          </span>
                          <span className={styles.transactionMeta}>
                            {txn.date.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' • '}
                            <span className={styles.sourceTag}>
                              {txn.source === 'activity' ? 'GPay' : 'Card'}
                            </span>
                          </span>
                        </div>
                        <span className={styles.transactionAmount}>
                          {formatAmount(convertToINR(txn.amount))}
                        </span>
                      </div>
                    ))}
                    {transactions.length > 50 && (
                      <div className={styles.moreItems}>
                        +{transactions.length - 50} more transactions
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {categoryData.length === 0 && (
          <div className={styles.noData}>
            <p>No spending data found for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
