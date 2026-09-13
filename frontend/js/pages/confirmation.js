import '../main.js';
import { getOrder } from '../api/orders.js';
import { qs } from '../lib/dom.js';
import { formatPrice } from '../lib/format.js';
import { showError, withStatus } from '../lib/status.js';
import { shippingFor } from '../store/cart.js';
import { LOCALE } from '../config.js';
import { ORDER_ID_PARAM, currentParam } from '../routes.js';

const page = qs('[data-order-confirmation]');
const template = page.innerHTML;

const shippingDate = (createdAt) => {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString(LOCALE);
};

const load = async () => {
  const id = currentParam(ORDER_ID_PARAM);

  if (!id) {
    showError(page, 'No order to show.');
    return;
  }

  const order = await withStatus(page, () => getOrder(id), {
    loadingMessage: 'Loading your order',
    onRetry: load,
  });

  if (!order) return;

  page.innerHTML = template;
  qs('[data-order-id]').textContent = order.id;
  qs('[data-order-shipping]').textContent = shippingDate(order.createdAt);
  qs('[data-order-total]').textContent = formatPrice(order.total + shippingFor(order.total));
};

load();
