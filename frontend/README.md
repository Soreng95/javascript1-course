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
  env.js                 Environment detection, per-environment settings
  config.js              Values derived from the active environment
  routes.js              Every internal page URL in one place
  main.js                Shared bootstrap, exposes window.RainyDays
  api/
    endpoints.js         Every API path in one place
    http.js              request / get / post / put, timeouts, ApiError
    schemas.js           Expected shape of every API response
    products.js          getProducts(filters), getProduct(id), getTags()
    orders.js            createOrder(payload), getOrder(id)
  lib/
    types.js             Runtime type guards, assertions, shape validation
    dom.js               qs, qsa, el, clear, onReady
    format.js            formatPrice, formatAmount, formatSizes
    status.js            showLoading, showError, showEmpty, withStatus
  store/
    cart.js              localStorage basket, totals, subscribe()
  components/
    cart-badge.js        Live item count in the header
  pages/                 One module per page (to be written)
```

## Environments

`js/env.js` picks the environment from the hostname: `localhost` and `127.0.0.1` resolve to
`local`, anything else to `production`. Each environment carries its own API base URL, request
timeout and debug flag.

Override it without editing code by loading any page with `?env=production` or `?env=local`.
The choice is remembered in `localStorage`, so you only pass it once. From the console:

```js
RainyDays.env.setEnvironment('production');
RainyDays.env.clearEnvironmentOverride();
```

The production URL in `js/env.js` is a placeholder and must be updated once the API is deployed.

## Globals

`main.js` runs on every page and exposes everything under `window.RainyDays`, so the modules are
reachable from any script and from the browser console:

```
RainyDays.env        ENV, isLocal(), isProduction(), setEnvironment()
RainyDays.http       request, get, post, put, ApiError
RainyDays.endpoints  ENDPOINTS, toAbsoluteUrl(), withQuery()
RainyDays.api        products, orders
RainyDays.cart       the basket store
RainyDays.types      guards, assertions, shape validation
RainyDays.format     price and amount formatting
RainyDays.routes     internal page URLs
```

Inside your own modules prefer a normal `import` over the global; the namespace exists for
console debugging and for scripts that are not modules.

## HTTP

`js/api/http.js` exports one function per verb. Each takes an endpoint from
`js/api/endpoints.js`, never a hand-written URL.

```js
import { ENDPOINTS, withQuery } from '../api/endpoints.js';
import { get, post, put } from '../api/http.js';

await get(withQuery(ENDPOINTS.products.list(), { gender: 'Female' }));
await post(ENDPOINTS.orders.create(), payload);
await put(ENDPOINTS.products.detail(id), changes);
```

Blank, `null` and `undefined` query values are dropped automatically. Every call has a timeout,
turns non-2xx responses into an `ApiError` carrying `status` and `body`, and converts network
failures into a message safe to show a user.

The backend currently has no `PUT` route, and its CORS allowlist is `GET, POST, OPTIONS`.
`put()` is ready but will fail until a route is added on the server.

## Type checking

`js/lib/types.js` replaces the compile-time safety TypeScript would give.

**Guards** return a boolean: `isString`, `isNonEmptyString`, `isNumber`, `isInteger`,
`isPositiveNumber`, `isBoolean`, `isArray`, `isArrayOf`, `isObject`, `isFunction`, `isNullish`,
`isOneOf`, `isEmail`, `isUrl`, `typeOf`.

**Assertions** return the value or throw a `ValidationError` naming the field:

```js
import { assertInteger } from '../lib/types.js';

assertInteger(quantity, 'quantity');
```

**Fallbacks** never throw: `ensureString(value, '')`, `ensureNumber(value, 0)`, `ensureArray`,
`ensureBoolean`, `ensureObject`.

**Shapes** validate whole objects, including nested ones, and report the exact path that failed
(`products[0].image.url must be a string, received number`):

```js
import { field, optional, shapeOf, validateShape } from '../lib/types.js';

const SHAPE = {
  id: field.nonEmptyString,
  quantity: field.integer,
  image: shapeOf({ url: field.string }),
  note: optional(field.string),
};

validateShape(value, SHAPE, 'orderLine');
```

`js/api/schemas.js` applies this to every API response. If the server ever returns a product
without a price, or a string where a number belongs, the call rejects with an `ApiError` instead
of leaking bad data into the page.

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
| `product/index.html` | `data-product-detail`, `data-related-grid` |
| `cart-page/index.html` | `data-cart-list`, `data-cart-totals` |
| `checkout/index.html` | `data-checkout-form`, `data-checkout-summary` |
| `checkout/confirmation/index.html` | `data-order-confirmation` |
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
| 6. Order confirmation | `js/pages/confirmation.js` |
| 11. Filtering | `js/pages/products.js` |
| 12. Category pages | new pages under `category/` |
| 13. Terms and Privacy | new pages |
