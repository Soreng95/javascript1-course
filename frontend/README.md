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
    format.js            formatPrice
    status.js            showLoading, showError, showEmpty, withStatus
  store/
    cart.js              localStorage basket, totals, subscribe()
  components/
    cart-badge.js        Live item count in the header
    product-card.js      One card in a product grid
    cart-view.js         Cart rows and totals, shared by cart and checkout
    suggestions.js       "You may like" grid
  pages/
    home.js              Grid, Carefully Selected and the mobile carousel
    products.js          Listing, filtering and sorting; also the category pages
    product.js           Detail view, size selection, add to cart
    cart.js              Cart page
    checkout.js          Checkout summary and order submission
    confirmation.js      Order receipt
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
| `index.html` | `data-product-grid`, `data-featured-list`, `data-featured-carousel` |
| `products/index.html` | `data-product-grid`, `data-favorites-grid`, `data-filters`, `data-filter`, `data-sort` |
| `category/*.html` | the same, plus `data-gender` on the grid to lock the category |
| `product/index.html` | `data-product-detail`, `data-product-image`, `data-sizes`, `data-add-to-cart`, `data-related-grid` |
| `cart-page/index.html` | `data-cart-list`, `data-cart-totals`, `data-suggestions-grid` |
| `checkout/index.html` | `data-checkout-form`, `data-checkout-list`, `data-checkout-totals`, `data-pay` |
| `checkout/confirmation/index.html` | `data-order-id`, `data-order-shipping`, `data-order-total` |
| every page | `data-cart-link` |

## Adding a page module

1. Create `js/pages/<page>.js`.
2. Import `../main.js` first so the shared bootstrap runs.
3. Point the page at it: `<script type="module" src="../js/pages/<page>.js"></script>`,
   replacing the existing `main.js` tag.

## Pages

| Page | Module |
| --- | --- |
| `index.html` | `js/pages/home.js` |
| `products/index.html` | `js/pages/products.js` |
| `category/mens-clothing.html` | `js/pages/products.js` with `data-gender="Male"` |
| `category/womens-clothing.html` | `js/pages/products.js` with `data-gender="Female"` |
| `product/index.html` | `js/pages/product.js`, reads `?id=` |
| `cart-page/index.html` | `js/pages/cart.js` |
| `checkout/index.html` | `js/pages/checkout.js` |
| `checkout/confirmation/index.html` | `js/pages/confirmation.js`, reads `?order=` |
| `terms/`, `privacy/`, `coming-soon/` | static, `js/main.js` only |

## Filtering

The products page keeps its filters in the query string, so a filtered view can be shared and
survives a reload:

```
products/index.html?gender=Male&baseColor=Black&sort=discountedPrice&order=asc
```

Colour and product options are read from the API at startup rather than written into the markup.
A category page sets `data-gender` on its grid; that preset is merged over the query string, so
the category cannot be filtered away.

## Known limitations

- Orders are stored in memory by the API. Restarting the backend makes existing order ids
  return 404.
- The production API URL in `js/env.js` is a placeholder and must be updated before deploying.
- The specification table and the star rating on the product page are static design elements.
  The API carries no data for them.
