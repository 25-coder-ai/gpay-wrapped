import { GroupExpense, Voucher } from '../types/data.types';
import { parseCurrency } from './currencyUtils';

export interface JSONParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

/**
 * Remove anti-XSSI prefix ")]}'" from JSON string
 * Google uses this prefix to prevent JSON hijacking
 */
function removeAntiXSSIPrefix(jsonString: string): string {
  if (jsonString.startsWith(")]}'\n")) {
    return jsonString.slice(5);
  }
  if (jsonString.startsWith(")]}' ")) {
    return jsonString.slice(5);
  }
  return jsonString;
}

/**
 * Parse group expenses JSON
 */
export function parseGroupExpensesJSON(jsonString: string): JSONParseResult<GroupExpense> {
  try {
    if (!jsonString || jsonString.trim().length === 0) {
      return { success: true, data: [] };
    }

    const cleaned = removeAntiXSSIPrefix(jsonString);
    const parsed = JSON.parse(cleaned);

    // Handle different JSON structures
    let expenses = Array.isArray(parsed) ? parsed : parsed.groupExpenses || [];

    const transformedExpenses = expenses
      .map((expense: any) => {
        try {
          if (!expense.creationTime) {
            return null;
          }

          return {
            creationTime: new Date(expense.creationTime),
            creator: expense.creator || '',
            groupName: expense.groupName || '',
            totalAmount: parseCurrency(expense.totalAmount || ''),
            state: expense.state || 'ONGOING',
            title: expense.title || '',
            items: (expense.items || []).map((item: any) => ({
              amount: parseCurrency(item.amount || ''),
              state: item.state || 'UNPAID',
              payer: item.payer || '',
            })),
          } as GroupExpense;
        } catch (error) {
          return null;
        }
      })
      .filter((item): item is GroupExpense => item !== null);

    return { success: true, data: transformedExpenses };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    };
  }
}

/**
 * Parse voucher rewards JSON
 */
export function parseVoucherRewardsJSON(jsonString: string): JSONParseResult<Voucher> {
  try {
    if (!jsonString || jsonString.trim().length === 0) {
      return { success: true, data: [] };
    }

    const cleaned = removeAntiXSSIPrefix(jsonString);
    const parsed = JSON.parse(cleaned);

    // Handle different JSON structures
    let vouchers = Array.isArray(parsed) ? parsed : parsed.vouchers || [];

    const transformedVouchers = vouchers
      .map((voucher: any) => {
        try {
          if (!voucher.code) {
            return null;
          }

          return {
            code: voucher.code,
            details: voucher.details || '',
            summary: voucher.summary || '',
            expiryDate: voucher.expiryDate ? new Date(voucher.expiryDate) : new Date(),
          } as Voucher;
        } catch (error) {
          return null;
        }
      })
      .filter((item): item is Voucher => item !== null);

    return { success: true, data: transformedVouchers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    };
  }
}

/**
 * Generic JSON parser with optional transformation
 */
export function parseJSON<T>(
  jsonString: string,
  transform?: (data: any) => T[] | null
): JSONParseResult<T> {
  try {
    if (!jsonString || jsonString.trim().length === 0) {
      return { success: true, data: [] };
    }

    const cleaned = removeAntiXSSIPrefix(jsonString);
    const parsed = JSON.parse(cleaned);

    if (!transform) {
      const data = Array.isArray(parsed) ? parsed : [parsed];
      return { success: true, data: data as T[] };
    }

    const transformed = transform(parsed);
    if (transformed === null) {
      return { success: false, error: 'Transformation failed' };
    }

    return { success: true, data: transformed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
    };
  }
}
