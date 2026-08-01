import type { TachibanaMarketPriceResponse } from './types.js';

// The shape follows the official CLMMfdsGetMarketPrice response.
const mockResponse: TachibanaMarketPriceResponse = {
  sCLMID: 'CLMMfdsGetMarketPrice',
  aCLMMfdsMarketPrice: [
    {
      sIssueCode: '5367',
      pDPP: '1255',
      pPRP: '1240',
      'tDPP:T': '153000',
    },
    {
      sIssueCode: '7974',
      pDPP: '7420',
      pPRP: '7380',
      'tDPP:T': '153000',
    },
  ],
};

export async function callTachibana(): Promise<TachibanaMarketPriceResponse> {
  return mockResponse;
}
