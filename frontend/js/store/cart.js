import { CART_STORAGE_KEY, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../config.js';

const listeners = new Set();

const lineId = (productId, size) => `${productId}::${size ?? ''}`;

const read = () => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    return;
  } finally {
    listeners.forEach((listener) => listener(items));
  }
};

export const getItems = () => read();

export const getCount = () => read().reduce((total, item) => total + item.quantity, 0);

export const getSubtotal = () =>
  read().reduce((total, item) => total + item.price * item.quantity, 0);

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

export const getShipping = () => shippingFor(getSubtotal());

export const getTotal = () => getSubtotal() + getShipping();

export const isEmpty = () => read().length === 0;

export const addItem = (product, { size = null, quantity = 1 } = {}) => {
  const items = read();
  const id = lineId(product.id, size);
  const existing = items.find((item) => item.id === id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 99);
  } else {
    items.push({
      id,
      productId: product.id,
      title: product.title,
      price: product.discountedPrice ?? product.price,
      image: product.image?.url ?? '',
      imageAlt: product.image?.alt ?? product.title,
      baseColor: product.baseColor ?? '',
      size,
      quantity: Math.min(quantity, 99),
    });
  }

  write(items);
  return items;
};

export const setQuantity = (id, quantity) => {
  if (quantity < 1) return removeItem(id);

  const items = read().map((item) =>
    item.id === id ? { ...item, quantity: Math.min(quantity, 99) } : item,
  );

  write(items);
  return items;
};

export const increment = (id) => {
  const item = read().find((entry) => entry.id === id);
  return item ? setQuantity(id, item.quantity + 1) : read();
};

export const decrement = (id) => {
  const item = read().find((entry) => entry.id === id);
  return item ? setQuantity(id, item.quantity - 1) : read();
};

export const removeItem = (id) => {
  const items = read().filter((item) => item.id !== id);
  write(items);
  return items;
};

export const clearCart = () => write([]);

export const toOrderPayload = (email) => ({
  items: read().map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    ...(item.size ? { size: item.size } : {}),
  })),
  ...(email ? { email } : {}),
});

export const subscribe = (listener) => {
  listeners.add(listener);
  listener(read());
  return () => listeners.delete(listener);
};

window.addEventListener('storage', (event) => {
  if (event.key === CART_STORAGE_KEY) {
    listeners.forEach((listener) => listener(read()));
  }
});
