import '../main.js';
import { getProduct, getProducts } from '../api/products.js';
import { productCard } from '../components/product-card.js';
import { addItem } from '../store/cart.js';
import { el, qs } from '../lib/dom.js';
import { formatPrice } from '../lib/format.js';
import { showError, withStatus } from '../lib/status.js';
import { PRODUCT_ID_PARAM, currentParam } from '../routes.js';

const COLORS = { sand: '#c2b280' };

const detail = qs('[data-product-detail]');
const template = detail.innerHTML;

let selectedSize = null;
let quantity = 1;

const say = (message, isError = false) => {
  const feedback = qs('[data-feedback]');
  feedback.textContent = message;
  feedback.classList.toggle('product-summary__feedback--error', isError);
};

const setQuantity = (value) => {
  quantity = Math.min(Math.max(value, 1), 99);
  qs('[data-quantity]').textContent = quantity;
};

const selectSize = (size, button) => {
  qs('[data-sizes]')
    .querySelectorAll('button')
    .forEach((other) => other.classList.remove('product-summary__size--selected'));

  button.classList.add('product-summary__size--selected');
  selectedSize = size;
  say('');
};

const addToCart = (product) => {
  if (!selectedSize) {
    say('Please choose a size first.', true);
    return;
  }

  addItem(product, { size: selectedSize, quantity });
  say(`Added ${quantity} × size ${selectedSize} to your cart.`);
};

const render = (product) => {
  qs('[data-title]').textContent = product.title;
  qs('[data-price]').textContent = formatPrice(product.discountedPrice);
  qs('[data-description]').textContent = product.description;

  const image = qs('[data-product-image]');
  image.src = product.image.url;
  image.alt = product.image.alt;

  const color = product.baseColor;
  qs('[data-color]').append(
    el('span', {
      class: 'product-summary__color',
      style: `background: ${COLORS[color.toLowerCase()] ?? color}`,
      title: color,
    }),
  );

  product.sizes.forEach((size) => {
    const button = el('button', { type: 'button', class: 'product-summary__size', text: size });
    button.addEventListener('click', () => selectSize(size, button));
    qs('[data-sizes]').append(button);
  });

  qs('[data-quantity-decrease]').addEventListener('click', () => setQuantity(quantity - 1));
  qs('[data-quantity-increase]').addEventListener('click', () => setQuantity(quantity + 1));
  qs('[data-add-to-cart]').addEventListener('click', () => addToCart(product));
};

const renderRelated = async (product) => {
  const grid = qs('[data-related-grid]');

  try {
    const products = await getProducts({ gender: product.gender, limit: 5 });

    products
      .filter((item) => item.id !== product.id)
      .slice(0, 4)
      .forEach((item) => grid.append(productCard(item)));
  } catch {
    grid.closest('section').hidden = true;
  }
};

const load = async () => {
  const id = currentParam(PRODUCT_ID_PARAM);

  if (!id) {
    showError(detail, 'No product was selected.');
    return;
  }

  selectedSize = null;
  quantity = 1;

  const product = await withStatus(detail, () => getProduct(id), {
    loadingMessage: 'Loading product',
    onRetry: load,
  });

  if (!product) return;

  detail.innerHTML = template;
  render(product);
  renderRelated(product);
};

load();
