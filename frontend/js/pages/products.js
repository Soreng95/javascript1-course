import '../main.js';
import { getProducts } from '../api/products.js';
import { productCard } from '../components/product-card.js';
import { clear, qs } from '../lib/dom.js';
import { showEmpty, withStatus } from '../lib/status.js';

const grid = qs('[data-product-grid]');
const favoritesGrid = qs('[data-favorites-grid]');

const render = (container, products) => {
  clear(container);
  products.forEach((product) => container.append(productCard(product)));
};

const load = async () => {
  const products = await withStatus(grid, getProducts, {
    loadingMessage: 'Loading products',
    onRetry: load,
  });

  if (!products) return;

  if (products.length === 0) {
    showEmpty(grid, 'No products found.');
    return;
  }

  render(grid, products);
  render(favoritesGrid, products.filter((product) => product.favorite));
};

load();
