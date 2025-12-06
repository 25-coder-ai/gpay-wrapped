import JSZip from 'jszip';
import { RawExtractedData } from '../types';

interface ZipParserResult {
  success: boolean;
  data?: RawExtractedData;
  error?: string;
}

export async function extractZipFile(file: File): Promise<ZipParserResult> {
  try {
    const zip = await JSZip.loadAsync(file);

    const extractedData: RawExtractedData = {};

    // Find and read Google transactions CSV (wildcard filename)
    const transactionFile = Object.keys(zip.files).find(name =>
      name.includes('Google transactions/transactions_') && name.endsWith('.csv')
    );

    if (transactionFile) {
      extractedData.transactions = await zip.files[transactionFile].async('text');
    }

    // Read group expenses JSON
    const groupExpensesPath = 'Google Pay/Group expenses/Group expenses.json';
    if (zip.files[groupExpensesPath]) {
      extractedData.groupExpenses = await zip.files[groupExpensesPath].async('text');
    }

    // Read cashback rewards CSV
    const cashbackPath = 'Google Pay/Rewards earned/Cashback rewards.csv';
    if (zip.files[cashbackPath]) {
      extractedData.cashbackRewards = await zip.files[cashbackPath].async('text');
    }

    // Read voucher rewards JSON (remove )]}' prefix if present)
    const voucherPath = 'Google Pay/Rewards earned/Voucher rewards.json';
    if (zip.files[voucherPath]) {
      const raw = await zip.files[voucherPath].async('text');
      // Remove the anti-XSSI prefix )]}' if present
      extractedData.voucherRewards = raw.replace(/^\)\]\}'[\n\r]*/, '');
    }

    // Read money remittances CSV
    const remittancesPath = 'Google Pay/Money remittances and requests/Money remittances and requests.csv';
    if (zip.files[remittancesPath]) {
      extractedData.remittances = await zip.files[remittancesPath].async('text');
    }

    // Check if we got at least one file
    if (Object.keys(extractedData).length === 0) {
      return {
        success: false,
        error: 'No Google Pay data found in the ZIP file. Please ensure you uploaded a Google Takeout export with Google Pay data.'
      };
    }

    return { success: true, data: extractedData };
  } catch (error) {
    console.error('Zip extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract ZIP file'
    };
  }
}
