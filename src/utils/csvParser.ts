import Papa from 'papaparse';

export interface CSVParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

/**
 * Generic CSV parser using PapaParse with TypeScript support
 * @param csvString - Raw CSV string
 * @param transform - Optional transformation function to convert row to desired type
 * @returns Parsed data array or error
 */
export function parseCSV<T>(
  csvString: string,
  transform?: (row: any) => T | null
): CSVParseResult<T> {
  try {
    if (!csvString || csvString.trim().length === 0) {
      return { success: true, data: [] };
    }

    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for custom parsing
    });

    if (result.errors.length > 0) {
      const errorMessages = result.errors.map(e => e.message).join(', ');
      return { success: false, error: `CSV parsing error: ${errorMessages}` };
    }

    // If no transform function provided, return raw data
    if (!transform) {
      return { success: true, data: result.data as T[] };
    }

    // Apply transformation and filter out null values
    const transformedData = result.data
      .map(transform)
      .filter((item): item is T => item !== null);

    return { success: true, data: transformedData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown CSV parsing error',
    };
  }
}

/**
 * Parse transaction CSV with custom transformation
 */
export function parseTransactionsCSV(csvString: string) {
  return parseCSV(csvString, (row) => {
    try {
      // Skip invalid rows
      if (!row.Time || !row.ID) {
        return null;
      }

      return {
        time: new Date(row.Time),
        id: row.ID,
        description: row.Description || '',
        product: row.Product || '',
        method: row.Method || '',
        status: row.Status || '',
        amount: row.Amount || '', // Will be parsed by currencyUtils
      };
    } catch (error) {
      return null;
    }
  });
}

/**
 * Parse cashback rewards CSV with custom transformation
 */
export function parseCashbackRewardsCSV(csvString: string) {
  return parseCSV(csvString, (row) => {
    try {
      // Skip invalid rows
      if (!row.Date) {
        return null;
      }

      return {
        date: new Date(row.Date),
        currency: row.Currency || 'INR',
        amount: row.Amount || '0',
        description: row.Description || '',
      };
    } catch (error) {
      return null;
    }
  });
}
