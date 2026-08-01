export type TachibanaMarketPrice = {
  sIssueCode: string;
  pDPP: string;
  pPRP: string;
  'tDPP:T': string;
};

export type TachibanaMarketPriceResponse = {
  sCLMID: 'CLMMfdsGetMarketPrice';
  aCLMMfdsMarketPrice: TachibanaMarketPrice[];
};
