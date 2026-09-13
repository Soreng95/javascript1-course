const siteRoot = new URL('../', import.meta.url);

const withQuery = (path, params) => {
  const url = new URL(path, siteRoot);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.href;
};

export const PRODUCT_ID_PARAM = 'id';

export const ORDER_ID_PARAM = 'order';

export const routes = {
  home: () => new URL('index.html', siteRoot).href,
  products: (filters = {}) => withQuery('products/index.html', filters),
  product: (id) => withQuery('product/index.html', { [PRODUCT_ID_PARAM]: id }),
  cart: () => new URL('cart-page/index.html', siteRoot).href,
  checkout: () => new URL('checkout/index.html', siteRoot).href,
  confirmation: (orderId) => withQuery('checkout/confirmation/index.html', { [ORDER_ID_PARAM]: orderId }),
  comingSoon: () => new URL('coming-soon/index.html', siteRoot).href,
};

export const asset = (path) => new URL(`assets/${path}`, siteRoot).href;

export const currentParam = (name) => new URLSearchParams(window.location.search).get(name);
