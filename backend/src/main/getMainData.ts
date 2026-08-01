import { getAlertSpreadsheet } from '../alerts/getAlertSpreadsheet.js';
import type { AlertSpreadsheetRow } from '../alerts/types.js';
import { callTachibana } from '../tachibana/callTachibana.js';
import type { TachibanaMarketPrice } from '../tachibana/types.js';

export type AlertStatus = AlertSpreadsheetRow & {
  marketPrice: TachibanaMarketPrice | null;
};

export async function getMainData(): Promise<AlertStatus[]> {
  const alerts = await getAlertSpreadsheet();
  const symbols = [...new Set(alerts.map(({ symbol }) => symbol))];
  const tachibanaResponse = await callTachibana(symbols);

  const marketPriceBySymbol = new Map(
    tachibanaResponse.aCLMMfdsMarketPrice.map((marketPrice) => [
      marketPrice.sIssueCode,
      marketPrice,
    ]),
  );

  return alerts.map((alert) => ({
    ...alert,
    marketPrice: marketPriceBySymbol.get(alert.symbol) ?? null,
  }));
}
