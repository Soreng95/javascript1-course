import { ENV } from './env.js';

export const API_BASE_URL = ENV.apiBaseUrl;

export const REQUEST_TIMEOUT_MS = ENV.requestTimeoutMs;

export const DEBUG = ENV.debug;

export const CART_STORAGE_KEY = 'rainy-days.cart.v1';

export const LOCALE = 'en-US';

export const CURRENCY = 'USD';

export const SHIPPING_COST = 9.99;

export const FREE_SHIPPING_THRESHOLD = 150;
