import type { AlertSpreadsheetRow } from './types.js';

const mockAlertRows: AlertSpreadsheetRow[] = [
  {
    symbol: '5367',
    name: 'ニッカトー',
    alertText: '1,200円で確認（モック）',
  },
  {
    symbol: '7974',
    name: '任天堂',
    alertText: '7,200円で確認（モック）',
  },
];

export async function getAlertSpreadsheet(): Promise<AlertSpreadsheetRow[]> {
  return mockAlertRows;
}
