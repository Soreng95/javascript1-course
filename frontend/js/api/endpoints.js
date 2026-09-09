import { API_BASE_URL } from '../config.js';

const path = (value) => (value.startsWith('/') ? value : `/${value}`);

export const ENDPOINTS = {
  health: () => '/health',
  products: {
    list: () => '/products',
    detail: (id) => `/products/${encodeURIComponent(id)}`,
    tags: () => '/products/tags',
  },
  orders: {
    create: () => '/orders',
    detail: (id) => `/orders/${encodeURIComponent(id)}`,
  },
  docs: () => '/docs',
};

export const toAbsoluteUrl = (endpoint) => `${API_BASE_URL}${path(endpoint)}`;

export const withQuery = (endpoint, params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, value);
  });

  const query = search.toString();
  return query ? `${path(endpoint)}?${query}` : path(endpoint);
};
