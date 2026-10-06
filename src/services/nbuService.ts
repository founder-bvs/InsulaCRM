import { NbuRate } from '../types';

let cachedRates: NbuRate = {
  usd: 41.50,
  eur: 44.80,
  updatedAt: new Date().toISOString()
};

export const fetchNbuRates = async (): Promise<NbuRate> => {
  try {
    const res = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    if (!res.ok) throw new Error('NBU API error');
    const data = await res.json();

    const usdItem = data.find((item: any) => item.cc === 'USD');
    const eurItem = data.find((item: any) => item.cc === 'EUR');

    if (usdItem && eurItem) {
      cachedRates = {
        usd: Number(usdItem.rate.toFixed(2)),
        eur: Number(eurItem.rate.toFixed(2)),
        updatedAt: new Date().toISOString()
      };
    }
    return cachedRates;
  } catch (err) {
    // Return cached fallback
    return cachedRates;
  }
};

export const getNbuRates = (): NbuRate => cachedRates;

export const convertUsdToUah = (usdAmount: number, rate = cachedRates.usd): number => {
  return Math.round(usdAmount * rate);
};

export const convertUahToUsd = (uahAmount: number, rate = cachedRates.usd): number => {
  return Math.round(uahAmount / (rate || 1));
};

export const formatCurrency = (amount: number, currency: 'USD' | 'UAH' | 'EUR' = 'USD'): string => {
  if (currency === 'USD') return `$${amount.toLocaleString()}`;
  if (currency === 'EUR') return `€${amount.toLocaleString()}`;
  return `${amount.toLocaleString()} ₴`;
};
