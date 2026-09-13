import '../main.js';
import { getProducts } from '../api/products.js';
import { productCard } from '../components/product-card.js';
import { clear, el, qs } from '../lib/dom.js';
import { formatPrice } from '../lib/format.js';
import { withStatus } from '../lib/status.js';
import { routes } from '../routes.js';

const grid = qs('[data-product-grid]');
const featured = qs('[data-featured-list]');
const carousel = qs('[data-featured-carousel]');

const image = (product, className) =>
  el('img', {
    class: className,
    src: product.image.url,
    alt: product.image.alt,
    loading: 'lazy',
  });

const title = (product, className) => el('h3', { class: className, text: product.title });

const price = (product, className) =>
  el('p', { class: className, text: formatPrice(product.discountedPrice) });

const link = (product, className) =>
  el('a', { class: className, href: routes.product(product.id), text: 'View product' });

const featuredItem = (product) =>
  el('article', { class: 'featured-item' }, [
    image(product, 'featured-item__image'),
    el('div', { class: 'featured-item__content' }, [
      title(product, 'featured-item__title'),
      price(product, 'featured-item__price'),
    ]),
    link(product, 'featured-item__button'),
  ]);

const carouselCard = (product) =>
  el('article', { class: 'featured-carousel__card' }, [
    image(product, 'featured-carousel__image'),
    el('div', { class: 'featured-carousel__content' }, [
      title(product, 'featured-carousel__title'),
      price(product, 'featured-carousel__price'),
      link(product, 'featured-carousel__button'),
    ]),
  ]);

const fill = (container, products, build) => {
  clear(container);
  products.forEach((product) => container.append(build(product)));
};

const load = async () => {
  const products = await withStatus(grid, getProducts, {
    loadingMessage: 'Loading products',
    onRetry: load,
  });

  if (!products) return;

  const favorites = products.filter((product) => product.favorite).slice(0, 3);

  fill(grid, products.slice(0, 4), productCard);
  fill(featured, favorites, featuredItem);
  fill(carousel, favorites, carouselCard);
};

load();
