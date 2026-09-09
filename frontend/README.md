# Rainy Days — Frontend

Vanilla JavaScript storefront for the Rainy Days e-commerce project. The frontend talks to the
NestJS backend in `../backend` as a plain REST API.

## Running locally

Two servers must be running.

**1. API** (port 8080)

```
cd ../backend
npm install
npm run start:dev
```

Swagger UI: http://localhost:8080/api/docs

**2. Frontend** (port 5500)

Use the VS Code *Live Server* extension, or:

```
python3 -m http.server 5500
```

Open http://localhost:5500/index.html

The API base URL lives in `js/config.js`. `CORS_ORIGIN` in `../backend/.env` already allows
ports 5500, 5501, 3000 and 8000.

## JavaScript structure

```
js/
  config.js              API base URL, storage key, locale, shipping rules
  routes.js              Every internal page URL in one place
  main.js                Shared bootstrap, loaded by every page
  api/
    http.js              fetch wrapper: timeouts, JSON parsing, ApiError
    products.js          getProducts(filters), getProduct(id), getTags()
    orders.js            createOrder(payload), getOrder(id)
  lib/
    dom.js               qs, qsa, el, clear, onReady
    format.js            formatPrice, formatAmount, formatSizes
    status.js            showLoading, showError, showEmpty, withStatus
  store/
    cart.js              localStorage basket, totals, subscribe()
  components/
    cart-badge.js        Live item count in the header
  pages/                 One module per page (to be written)
```

### Loading and error states

`withStatus` wraps any async call and renders the spinner, then either clears it or shows an
error with a retry button:

```js
import { withStatus } from '../lib/status.js';
import { getProducts } from '../api/products.js';

const grid = document.querySelector('[data-product-grid]');

const load = async () => {
  const products = await withStatus(grid, () => getProducts({ gender: 'Female' }), {
    loadingMessage: 'Loading products',
    onRetry: load,
  });

  if (!products) return;
  render(grid, products);
};

load();
```

### Cart

```js
import { addItem, getItems, getCount, subscribe, toOrderPayload } from '../store/cart.js';

addItem(product, { size: 'M', quantity: 2 });
subscribe((items) => console.log(items.length));
```

State lives in `localStorage` under `rainy-days.cart.v1`, survives navigation, and syncs across
open tabs. `toOrderPayload(email)` produces the exact body `POST /api/orders` expects.

## DOM hooks

Render targets are marked with data attributes so the markup and the JavaScript stay decoupled.

| Page | Hook |
| --- | --- |
| `index.html` | `data-product-grid`, `data-featured-list` |
| `products/index.html` | `data-product-grid`, `data-filters` |
| `products/[slug]/index.html` | `data-product-detail`, `data-related-grid` |
| `cart-page/index.html` | `data-cart-list`, `data-cart-totals` |
| `checkout/index.html` | `data-checkout-form`, `data-checkout-summary` |
| `success/[slug]/index.html` | `data-order-confirmation` |
| every page | `data-cart-link` |

## Adding a page module

1. Create `js/pages/<page>.js`.
2. Import `../main.js` first so the shared bootstrap runs.
3. Point the page at it: `<script type="module" src="../js/pages/<page>.js"></script>`,
   replacing the existing `main.js` tag.

## Next steps

| Requirement | Module to write |
| --- | --- |
| 1. Product list on the homepage | `js/pages/home.js` |
| 2. Single product page | `js/pages/product.js` |
| 3. Add to basket | `js/pages/product.js`, `js/pages/products.js` |
| 4. Remove from basket | `js/pages/cart.js` |
| 5. Cart summary and total | `js/pages/cart.js` |
| 6. Order confirmation | `js/pages/success.js` |
| 11. Filtering | `js/pages/products.js` |
| 12. Category pages | new pages under `category/` |
| 13. Terms and Privacy | new pages |
