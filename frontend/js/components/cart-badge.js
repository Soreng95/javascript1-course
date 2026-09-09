import { qsa, el } from '../lib/dom.js';
import { subscribe } from '../store/cart.js';

const badgeFor = (link) => {
  const existing = link.querySelector('.cart-badge');
  if (existing) return existing;

  const badge = el('span', { class: 'cart-badge', 'aria-hidden': 'true' });
  link.append(badge);
  return badge;
};

export const initCartBadge = () => {
  const links = qsa('[data-cart-link]');
  if (links.length === 0) return;

  subscribe((items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);

    links.forEach((link) => {
      const badge = badgeFor(link);
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.hidden = count === 0;
      link.setAttribute(
        'aria-label',
        count === 0 ? 'Cart, empty' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`,
      );
    });
  });
};
