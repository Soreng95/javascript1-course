import '../main.js';
import { getProducts, getTags } from '../api/products.js';
import { productCard } from '../components/product-card.js';
import { clear, el, qs, qsa } from '../lib/dom.js';
import { showEmpty, withStatus } from '../lib/status.js';

const grid = qs('[data-product-grid]');
const favoritesGrid = qs('[data-favorites-grid]');
const sortSelect = qs('[data-sort]');

const preset = grid.dataset.gender ? { gender: grid.dataset.gender } : {};

const currentFilters = () => ({
  ...Object.fromEntries(new URLSearchParams(window.location.search)),
  ...preset,
});

const render = (container, products) => {
  clear(container);
  products.forEach((product) => container.append(productCard(product)));
};

const load = async () => {
  const products = await withStatus(grid, () => getProducts(currentFilters()), {
    loadingMessage: 'Loading products',
    onRetry: init,
  });

  if (!products) return;

  if (products.length === 0) {
    showEmpty(grid, 'No products match these filters.');
  } else {
    render(grid, products);
  }

  render(favoritesGrid, products.filter((product) => product.favorite));
};

const updateUrl = () => {
  const params = new URLSearchParams();

  qsa('[data-filter]').forEach((select) => {
    if (select.value) params.set(select.dataset.filter, select.value);
  });

  const [sort, order] = sortSelect.value.split('-');
  params.set('sort', sort);
  params.set('order', order);

  window.history.replaceState(null, '', `?${params}`);
  load();
};

const debounce = (callback, delay = 300) => {
  let timer = null;

  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(callback, delay);
  };
};

const fillOptions = (select, values) => {
  select.length = 1;
  values.forEach((value) => select.append(el('option', { value, text: value })));
};

const init = async () => {
  const saved = currentFilters();
  const filters = qs('[data-filters]');

  try {
    const [products, tags] = await Promise.all([getProducts(), getTags()]);
    const colours = [...new Set(products.map((product) => product.baseColor))].sort();

    fillOptions(qs('[data-filter="baseColor"]'), colours);
    fillOptions(qs('[data-filter="tag"]'), tags);
    filters.hidden = false;
  } catch {
    filters.hidden = true;
  }

  const updateSoon = debounce(updateUrl);

  qsa('[data-filter]').forEach((field) => {
    field.value = saved[field.dataset.filter] ?? '';

    if (field.tagName === 'INPUT') {
      field.addEventListener('input', updateSoon);
    } else {
      field.addEventListener('change', updateUrl);
    }
  });

  if (saved.sort) sortSelect.value = `${saved.sort}-${saved.order ?? 'asc'}`;
  sortSelect.addEventListener('change', updateUrl);

  load();
};

init();
