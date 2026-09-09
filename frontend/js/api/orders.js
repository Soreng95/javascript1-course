import { ENDPOINTS } from './endpoints.js';
import { get, post } from './http.js';
import { parseOrder } from './schemas.js';
import { assertArray, assertNonEmptyString, validateShape, field, optional } from '../lib/types.js';

const ORDER_ITEM_SHAPE = {
  productId: field.nonEmptyString,
  quantity: field.integer,
  size: optional(field.string),
};

export const createOrder = (payload) => {
  assertArray(payload?.items, 'order.items');
  payload.items.forEach((item, index) => validateShape(item, ORDER_ITEM_SHAPE, `order.items[${index}]`));

  return post(ENDPOINTS.orders.create(), payload, { validate: parseOrder });
};

export const getOrder = (id) => {
  assertNonEmptyString(id, 'orderId');
  return get(ENDPOINTS.orders.detail(id), { validate: parseOrder });
};
