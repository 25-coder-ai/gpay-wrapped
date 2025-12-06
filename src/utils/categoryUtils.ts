// Category classification utilities

import categories from '../categories.json';
import { Currency } from '../types/data.types';

export type TransactionCategory =
  | 'Food'
  | 'Groceries'
  | 'Clothing'
  | 'Entertainment'
  | 'E-commerce'
  | 'Travel & Transport'
  | 'Utilities & Bills'
  | 'Healthcare'
  | 'Education'
  | 'Investments'
  | 'Transfers'
  | 'Bank Transfers'
  | 'Others';

/**
 * Convert any currency to INR for aggregation
 * Assumes 1 USD ≈ 83 INR (approximate exchange rate)
 */
export function convertToINR(amount: Currency): number {
  if (amount.currency === 'INR') {
    return amount.value;
  }
  // Convert USD to INR
  return amount.value * 83;
}

/**
 * Categorize a transaction or activity based on description
 * Uses keyword matching from categories.json + smart pattern detection
 */
export function categorizeTransaction(description: string): TransactionCategory {
  const lowerDesc = description.toLowerCase();

  // Check for bank account transfers first (self-transfers, account-to-account)
  const bankTransferPatterns = [
    /using bank account/i,      // "Paid ₹X using Bank Account XXXX"
    /bank transfer/i,
    /to\s+\w*bank/i,            // "to SBI Bank", "to HDFC Bank"
    /from\s+\w*bank/i,
    /neft/i,
    /imps/i,
    /rtgs/i,
    /upi.*bank/i,
    /account\s+xxxx/i,          // masked account numbers
  ];

  for (const pattern of bankTransferPatterns) {
    if (pattern.test(description)) {
      return 'Bank Transfers';
    }
  }

  // Check for person-to-person transfers (common in GPay)
  const transferPatterns = [
    /^sent\s+[₹$]/i,           // "Sent ₹500"
    /^received\s+[₹$]/i,       // "Received ₹500"
    /^paid\s+[₹$].*to\s+[a-z]/i,    // "Paid ₹500 to John" (to a person, not bank)
    /request/i,                 // payment requests
    /split/i,                   // split payments
    /settle/i,                  // settlement
  ];

  for (const pattern of transferPatterns) {
    if (pattern.test(description)) {
      // But first check if it matches a business category
      for (const [category, keywords] of Object.entries(categories)) {
        if (category === 'Others') continue;
        for (const keyword of keywords as string[]) {
          if (lowerDesc.includes(keyword.toLowerCase())) {
            return category as TransactionCategory;
          }
        }
      }
      // If no business match, it's a personal transfer
      return 'Transfers';
    }
  }

  // Check each category's keywords
  for (const [category, keywords] of Object.entries(categories)) {
    if (category === 'Others') continue; // Skip "Others" in first pass
    for (const keyword of keywords as string[]) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category as TransactionCategory;
      }
    }
  }

  // Check if it looks like a personal transfer without clear patterns
  // Names typically start with uppercase in descriptions
  const namePattern = /(?:to|from|paid)\s+[A-Z][a-z]+/;
  if (namePattern.test(description)) {
    return 'Transfers';
  }

  return 'Others'; // Default fallback
}

/**
 * Get category statistics for a list of transactions
 */
export function getCategoryStats(
  items: Array<{ description: string; amount: Currency }>
): Map<TransactionCategory, { count: number; total: number }> {
  const stats = new Map<TransactionCategory, { count: number; total: number }>();

  items.forEach(item => {
    const category = categorizeTransaction(item.description);
    const existing = stats.get(category) || { count: 0, total: 0 };

    existing.count++;
    existing.total += convertToINR(item.amount);

    stats.set(category, existing);
  });

  return stats;
}
