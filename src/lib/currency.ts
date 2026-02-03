const exchangeRates: Record<string, number> = {
  KRW: 1,
  USD: 0.00075,
  JPY: 0.11,
  CNY: 0.0054,
  EUR: 0.00069,
};

const currencySymbols: Record<string, string> = {
  KRW: '₩',
  USD: '$',
  JPY: '¥',
  CNY: '¥',
  EUR: '€',
};

const currencyLocales: Record<string, string> = {
  KRW: 'ko-KR',
  USD: 'en-US',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  EUR: 'de-DE',
};

export function convertCurrency(amountKRW: number, toCurrency: string): number {
  const rate = exchangeRates[toCurrency] || 1;
  return Math.round(amountKRW * rate * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  const locale = currencyLocales[currency] || 'ko-KR';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  }
}

export function formatPriceKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function getExchangeRate(currency: string): number {
  return exchangeRates[currency] || 1;
}

export function getAvailableCurrencies() {
  return Object.keys(exchangeRates).map(code => ({
    code,
    symbol: currencySymbols[code] || code,
  }));
}
