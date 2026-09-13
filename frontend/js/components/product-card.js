import { el } from '../lib/dom.js';
import { formatPrice } from '../lib/format.js';
import { routes } from '../routes.js';

export const productCard = (product) =>
  el('article', { class: 'product-gallery__card' }, [
    el('a', { class: 'product-gallery__link', href: routes.product(product.id) }, [
      el('img', {
        class: 'product-gallery__image',
        src: product.image.url,
        alt: product.image.alt,
        loading: 'lazy',
      }),
      el('div', { class: 'product-card-info' }, [
        el('div', { class: 'product-card-info__left' }, [
          el('p', { class: 'product-card-info__title', text: product.title }),
          el('p', { class: 'product-card-info__price', text: formatPrice(product.discountedPrice) }),
        ]),
        el('div', { class: 'product-card-info__right' }, [
          el('p', { class: 'product-card-info__sizes', text: product.sizes.join(' ') }),
        ]),
      ]),
    ]),
  ]);
