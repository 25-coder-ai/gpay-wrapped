import { create } from 'zustand';
import { DataStore, RawExtractedData, YearFilter } from '../types/storage.types';
import { ParsedData, Transaction, GroupExpense, CashbackReward, Voucher } from '../types/data.types';
import { Insight } from '../types/insight.types';
import { parseTransactionsCSV, parseCashbackRewardsCSV } from '../utils/csvParser';
import { parseGroupExpensesJSON, parseVoucherRewardsJSON } from '../utils/jsonParser';
import { parseCurrency } from '../utils/currencyUtils';

/**
 * Global data store using Zustand
 * Manages all app state including raw data, parsed data, insights, and UI state
 */
export const useDataStore = create<DataStore>((set, get) => ({
  // State
  rawData: null,
  parsedData: null,
  insights: [],
  selectedYear: '2025',
  isLoading: false,
  error: null,

  // Actions
  setRawData: (data: RawExtractedData) => {
    set({ rawData: data });
  },

  setParsedData: (data: ParsedData) => {
    set({ parsedData: data });
  },

  setInsights: (insights: Insight[]) => {
    set({ insights });
  },

  setSelectedYear: (year: YearFilter) => {
    set({ selectedYear: year });
    // Automatically recalculate insights when year changes
    get().recalculateInsights(year);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Parse raw data into structured format
   */
  parseRawData: () => {
    const { rawData } = get();
    if (!rawData) {
      return;
    }

    try {
      // Parse transactions CSV
      let transactions: Transaction[] = [];
      if (rawData.transactions) {
        const result = parseTransactionsCSV(rawData.transactions);
        if (result.success && result.data) {
          // Convert amount strings to Currency objects
          transactions = result.data.map(t => ({
            ...t,
            amount: typeof t.amount === 'string' ? parseCurrency(t.amount) : t.amount,
          })) as Transaction[];
        }
      }

      // Parse group expenses JSON
      let groupExpenses: GroupExpense[] = [];
      if (rawData.groupExpenses) {
        const result = parseGroupExpensesJSON(rawData.groupExpenses);
        if (result.success && result.data) {
          groupExpenses = result.data;
        }
      }

      // Parse cashback rewards CSV
      let cashbackRewards: CashbackReward[] = [];
      if (rawData.cashbackRewards) {
        const result = parseCashbackRewardsCSV(rawData.cashbackRewards);
        if (result.success && result.data) {
          // Convert amount strings to numbers
          cashbackRewards = result.data.map(r => ({
            ...r,
            amount: typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount,
          })) as CashbackReward[];
        }
      }

      // Parse voucher rewards JSON
      let voucherRewards: Voucher[] = [];
      if (rawData.voucherRewards) {
        const result = parseVoucherRewardsJSON(rawData.voucherRewards);
        if (result.success && result.data) {
          voucherRewards = result.data;
        }
      }

      const parsedData: ParsedData = {
        transactions,
        groupExpenses,
        cashbackRewards,
        voucherRewards,
      };

      set({ parsedData, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to parse data',
      });
    }
  },

  /**
   * Recalculate insights based on selected year
   * This will be implemented when we build the insight engine
   */
  recalculateInsights: (year: YearFilter) => {
    const { parsedData } = get();
    if (!parsedData) {
      return;
    }

    // TODO: Implement insight calculation engine
    // For now, just log that we would recalculate
    console.log(`Recalculating insights for year: ${year}`);

    // Filter data by year
    const filteredData = filterDataByYear(parsedData, year);
    console.log('Filtered data:', filteredData);

    // Insights will be calculated in Phase 2
    set({ insights: [] });
  },
}));

/**
 * Helper function to filter data by year
 */
function filterDataByYear(data: ParsedData, year: YearFilter): ParsedData {
  if (year === 'all') {
    return data;
  }

  const targetYear = parseInt(year);

  return {
    transactions: data.transactions.filter(t => t.time.getFullYear() === targetYear),
    groupExpenses: data.groupExpenses.filter(g => g.creationTime.getFullYear() === targetYear),
    cashbackRewards: data.cashbackRewards.filter(r => r.date.getFullYear() === targetYear),
    voucherRewards: data.voucherRewards, // Vouchers are not filtered by year
  };
}
