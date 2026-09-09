import { field, optional, shapeOf, validateList, validateShape } from '../lib/types.js';

export const IMAGE_SHAPE = {
  url: field.string,
  alt: field.string,
};

export const PRODUCT_SHAPE = {
  id: field.nonEmptyString,
  title: field.nonEmptyString,
  description: field.string,
  gender: field.string,
  sizes: field.stringArray,
  baseColor: field.string,
  price: field.number,
  discountedPrice: field.number,
  onSale: field.boolean,
  image: shapeOf(IMAGE_SHAPE),
  tags: optional(field.stringArray),
  favorite: optional(field.boolean),
};

export const ORDER_LINE_SHAPE = {
  product: shapeOf(PRODUCT_SHAPE),
  quantity: field.integer,
  size: optional(field.string),
  lineTotal: field.number,
};

export const ORDER_SHAPE = {
  id: field.nonEmptyString,
  items: field.array,
  itemCount: field.integer,
  subtotal: field.number,
  savings: field.number,
  total: field.number,
  email: optional(field.email),
  createdAt: field.nonEmptyString,
};

export const parseProduct = (value) => validateShape(value, PRODUCT_SHAPE, 'product');

export const parseProductList = (value) => validateList(value, PRODUCT_SHAPE, 'products');

export const parseOrder = (value) => {
  validateShape(value, ORDER_SHAPE, 'order');
  validateList(value.items, ORDER_LINE_SHAPE, 'order.items');
  return value;
};

export const parseTags = (value) => {
  validateShape({ tags: value }, { tags: field.stringArray }, 'response');
  return value;
};
