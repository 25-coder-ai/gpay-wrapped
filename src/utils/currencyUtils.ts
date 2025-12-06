import { Currency } from '../types/data.types';

/**
 * Parse currency strings like "INR 1,014.80" or "USD 25.00"
 * @param currencyString - String in format "CURRENCY VALUE"
 * @returns Currency object with value and currency type
 */
export function parseCurrency(currencyString: string): Currency {
  try {
    if (!currencyString || typeof currencyString !== 'string') {
      return { value: 0, currency: 'INR' };
    }

    const trimmed = currencyString.trim();

    // Split by space to separate currency code and value
    const parts = trimmed.split(' ');

    if (parts.length < 2) {
      return { value: 0, currency: 'INR' };
    }

    const currency = parts[0] as 'INR' | 'USD';
    const valueString = parts.slice(1).join(' '); // Handle cases with multiple spaces

    // Remove commas and parse as float
    const value = parseFloat(valueString.replace(/,/g, ''));

    if (isNaN(value)) {
      return { value: 0, currency: currency || 'INR' };
    }

    return {
      value,
      currency: currency === 'USD' ? 'USD' : 'INR',
    };
  } catch (error) {
    return { value: 0, currency: 'INR' };
  }
}

/**
 * Convert USD to INR using approximate exchange rate
 * @param amount - Amount in USD
 * @param exchangeRate - Exchange rate (default: 83)
 * @returns Amount in INR
 */
export function convertUSDtoINR(amount: number, exchangeRate: number = 83): number {
  return amount * exchangeRate;
}

/**
 * Convert any currency to INR
 * @param currency - Currency object
 * @returns Amount in INR
 */
export function toINR(currency: Currency): number {
  if (currency.currency === 'INR') {
    return currency.value;
  }
  return convertUSDtoINR(currency.value);
}

/**
 * Format currency for display
 * @param currency - Currency object
 * @returns Formatted string like "₹1,014.80" or "$25.00"
 */
export function formatCurrency(currency: Currency): string {
  const symbol = currency.currency === 'INR' ? '₹' : '$';
  const formatted = currency.value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Sum array of currencies (converts all to INR)
 * @param currencies - Array of currency objects
 * @returns Total in INR
 */
export function sumCurrencies(currencies: Currency[]): number {
  return currencies.reduce((total, curr) => total + toINR(curr), 0);
}
