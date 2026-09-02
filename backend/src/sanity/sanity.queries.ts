const PRODUCT_PROJECTION = `{
  "id": coalesce(productId, _id),
  title,
  description,
  gender,
  sizes,
  baseColor,
  price,
  "discountedPrice": coalesce(discountedPrice, price),
  "onSale": coalesce(discountedPrice, price) < price,
  "image": {
    "url": coalesce(image.asset->url, imageUrl),
    "alt": coalesce(image.alt, imageAlt, title)
  },
  tags,
  "favorite": coalesce(favorite, false)
}`;

export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(title asc) ${PRODUCT_PROJECTION}`;

export const PRODUCT_BY_ID_QUERY = `*[_type == "product" && (productId == $id || _id == $id)][0] ${PRODUCT_PROJECTION}`;
