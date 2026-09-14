import { onReady } from './lib/dom.js';
import { initCartBadge } from './components/cart-badge.js';
import { ENV, ENVIRONMENTS, isLocal, isProduction, setEnvironment, clearEnvironmentOverride } from './env.js';
import { ENDPOINTS, toAbsoluteUrl, withQuery } from './api/endpoints.js';
import { ApiError, get, post, put, request } from './api/http.js';
import * as products from './api/products.js';
import * as orders from './api/orders.js';
import * as cart from './store/cart.js';
import * as types from './lib/types.js';
import * as format from './lib/format.js';
import { routes } from './routes.js';

window.RainyDays = {
  env: { ENV, ENVIRONMENTS, isLocal, isProduction, setEnvironment, clearEnvironmentOverride },
  http: { request, get, post, put, ApiError },
  endpoints: { ENDPOINTS, toAbsoluteUrl, withQuery },
  api: { products, orders },
  cart,
  types,
  format,
  routes,
};

onReady(() => {
  initCartBadge();
});
