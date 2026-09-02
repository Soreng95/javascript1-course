import { writeFileSync } from 'fs';
import { join } from 'path';
import { PRODUCT_SEED } from '../src/data/products.seed';

const documents = PRODUCT_SEED.map((product) => ({
  _id: `product-${product.id}`,
  _type: 'product',
  productId: product.id,
  title: product.title,
  description: product.description,
  gender: product.gender,
  sizes: product.sizes,
  baseColor: product.baseColor,
  price: product.price,
  discountedPrice: product.onSale ? product.discountedPrice : undefined,
  imageUrl: product.image.url,
  imageAlt: product.image.alt,
  tags: product.tags,
  favorite: product.favorite,
}));

const target = join(__dirname, '..', 'sanity-studio', 'seed.ndjson');
writeFileSync(target, documents.map((doc) => JSON.stringify(doc)).join('\n') + '\n');

process.stdout.write(`Wrote ${documents.length} documents to ${target}\n`);
