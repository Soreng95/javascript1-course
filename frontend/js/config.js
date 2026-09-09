import { ENV } from './env.js';

export const API_BASE_URL = ENV.apiBaseUrl;

export const REQUEST_TIMEOUT_MS = ENV.requestTimeoutMs;

export const DEBUG = ENV.debug;

export const CART_STORAGE_KEY = 'rainy-days.cart.v1';

export const LOCALE = 'nb-NO';

export const CURRENCY = 'NOK';

export const SHIPPING_COST = 99;

export const FREE_SHIPPING_THRESHOLD = 1500;
