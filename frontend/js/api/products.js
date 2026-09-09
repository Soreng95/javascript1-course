import { request } from './http.js';

const toQueryString = (filters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const getProducts = (filters = {}) => request(`/products${toQueryString(filters)}`);

export const getProduct = (id) => request(`/products/${encodeURIComponent(id)}`);

export const getTags = () => request('/products/tags');
