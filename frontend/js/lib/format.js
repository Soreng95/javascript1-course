import { CURRENCY, LOCALE } from '../config.js';

const decimalFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (value) => `${compactFormatter.format(Math.round(value))},-`;

export const formatAmount = (value) => `${decimalFormatter.format(value)} ${CURRENCY}`;

export const formatSizes = (sizes = []) => sizes.join(' ');
