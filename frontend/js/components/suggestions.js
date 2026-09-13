import { getProducts } from '../api/products.js';
import { productCard } from './product-card.js';
import { qs } from '../lib/dom.js';

export const renderSuggestions = async () => {
  const grid = qs('[data-suggestions-grid]');

  try {
    const products = await getProducts({ limit: 4 });
    products.forEach((product) => grid.append(productCard(product)));
  } catch {
    grid.closest('section').hidden = true;
  }
};
