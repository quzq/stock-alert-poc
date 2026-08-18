import { getSheetValues } from './getSheetValues.js';

export type GoogleSheetProbeResult = {
  rows: number;
  columns: number;
  nonEmptyCells: number;
};

function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replaceAll("'", "''")}'`;
}

export async function probeGoogleSheet(): Promise<GoogleSheetProbeResult> {
  const sheetName = process.env.GOOGLE_SHEET_NAME?.trim();

  if (!sheetName) {
    throw new Error('GOOGLE_SHEET_NAME is not configured.');
  }

  const values = await getSheetValues(`${quoteSheetName(sheetName)}!A1:C3`);
  const columns = values.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );
  const nonEmptyCells = values.reduce(
    (count, row) =>
      count +
      row.filter(
        (value) => value !== null && value !== undefined && value !== '',
      ).length,
    0,
  );

  return {
    rows: values.length,
    columns,
    nonEmptyCells,
  };
}
