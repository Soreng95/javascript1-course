import { ENDPOINTS, withQuery } from './endpoints.js';
import { get } from './http.js';
import { parseProduct, parseProductList, parseTags } from './schemas.js';
import { assertNonEmptyString } from '../lib/types.js';

export const getProducts = (filters = {}) =>
  get(withQuery(ENDPOINTS.products.list(), filters), { validate: parseProductList });

export const getProduct = (id) => {
  assertNonEmptyString(id, 'productId');
  return get(ENDPOINTS.products.detail(id), { validate: parseProduct });
};

export const getTags = () => get(ENDPOINTS.products.tags(), { validate: parseTags });
