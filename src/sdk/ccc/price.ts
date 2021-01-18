export interface Status {
  timestamp: string;
  error_code: number;
  error_message?: any;
  elapsed: number;
  credit_count: number;
  notice?: any;
}

export interface USD {
  price: number;
  volume_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  last_updated: Date;
}

export interface Quote {
  USD: USD;
}

export interface Price {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: Date;
  tags: any[];
  max_supply: number;
  circulating_supply: number;
  total_supply: number;
  is_active: number;
  platform?: any;
  cmc_rank: number;
  is_fiat: number;
  last_updated: Date;
  quote: Quote;
}

export interface Data {
  [key: number]: Price;
}

export interface PriceResponse {
  status: Status;
  data: Data;
}
