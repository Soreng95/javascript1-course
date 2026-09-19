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
  home: () => siteRoot.href,
  products: (filters = {}) => withQuery('products/', filters),
  product: (id) => withQuery('product/', { [PRODUCT_ID_PARAM]: id }),
  cart: () => new URL('cart-page/', siteRoot).href,
  checkout: () => new URL('checkout/', siteRoot).href,
  confirmation: (orderId) => withQuery('checkout/confirmation/', { [ORDER_ID_PARAM]: orderId }),
  comingSoon: () => new URL('coming-soon/', siteRoot).href,
};

export const asset = (path) => new URL(`assets/${path}`, siteRoot).href;

export const currentParam = (name) => new URLSearchParams(window.location.search).get(name);
