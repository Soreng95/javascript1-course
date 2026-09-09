import { request } from './http.js';

export const createOrder = (payload) =>
  request('/orders', { method: 'POST', body: JSON.stringify(payload) });

export const getOrder = (id) => request(`/orders/${encodeURIComponent(id)}`);
