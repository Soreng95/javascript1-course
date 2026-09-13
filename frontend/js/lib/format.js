import { CURRENCY, LOCALE } from '../config.js';

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

export const formatPrice = (value) => priceFormatter.format(value);
