import { clear, el, qs } from '../lib/dom.js';
import { formatPrice } from '../lib/format.js';
import * as cart from '../store/cart.js';

const row = (item, prefix) =>
  el('article', { class: `${prefix}-item` }, [
    el('img', { class: `${prefix}-item__image`, src: item.image, alt: item.imageAlt }),
    el('div', { class: `${prefix}-item__content` }, [
      el('div', { class: `${prefix}-item__top` }, [
        el('div', {}, [
          el('h2', { class: `${prefix}-item__title`, text: item.title }),
          el('p', { class: `${prefix}-item__meta`, text: `Size ${item.size} / ${item.baseColor}` }),
          el('p', { class: `${prefix}-item__price`, text: formatPrice(item.price * item.quantity) }),
        ]),
        el('div', { class: `${prefix}-item__quantity` }, [
          el('button', {
            type: 'button',
            class: `${prefix}-item__qty-btn`,
            text: '−',
            'aria-label': `Decrease quantity of ${item.title}`,
            onclick: () => cart.decrement(item.id),
          }),
          el('span', { class: `${prefix}-item__qty-value`, text: item.quantity }),
          el('button', {
            type: 'button',
            class: `${prefix}-item__qty-btn`,
            text: '+',
            'aria-label': `Increase quantity of ${item.title}`,
            onclick: () => cart.increment(item.id),
          }),
        ]),
      ]),
      el('button', {
        type: 'button',
        class: 'cart-remove',
        text: 'Remove',
        'aria-label': `Remove ${item.title} from the cart`,
        onclick: () => cart.removeItem(item.id),
      }),
    ]),
  ]);

const totalsRow = (prefix, label, value, isTotal = false) =>
  el(
    'div',
    { class: `${prefix}-totals__row${isTotal ? ` ${prefix}-totals__row--total` : ''}` },
    [el('span', { text: label }), el('span', { text: value })],
  );

export const initCartView = (prefix) => {
  const list = qs(`[data-${prefix}-list]`);
  const totals = qs(`[data-${prefix}-totals]`);

  cart.subscribe((items) => {
    clear(list);
    clear(totals);

    if (items.length === 0) {
      list.append(el('p', { class: 'cart-empty', text: 'Your cart is empty.' }));
      return;
    }

    items.forEach((item) => list.append(row(item, prefix)));

    const shipping = cart.getShipping();

    totals.append(
      totalsRow(prefix, 'Subtotal', formatPrice(cart.getSubtotal())),
      totalsRow(prefix, 'Shipping', shipping === 0 ? 'Free' : formatPrice(shipping)),
      totalsRow(prefix, 'Total', formatPrice(cart.getTotal()), true),
    );
  });
};
