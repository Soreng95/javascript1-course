import { writeFileSync } from 'fs';
import { join, relative } from 'path';
import { PRODUCT_IMAGE_FILES, PRODUCT_SEED } from '../src/data/products.seed';

const repoRoot = join(__dirname, '..', '..');
const studioDir = join(__dirname, '..', 'sanity-studio');

const assetRef = (productId: string, imageUrl: string): string => {
  const localPath = PRODUCT_IMAGE_FILES[productId];
  if (!localPath) return `image@${imageUrl}`;

  const fromStudio = relative(studioDir, join(repoRoot, localPath));
  return `image@file://./${fromStudio}`;
};

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
  image: {
    _sanityAsset: assetRef(product.id, product.image.url),
    alt: product.image.alt,
  },
  tags: product.tags,
  favorite: product.favorite,
}));

const target = join(studioDir, 'seed.ndjson');
writeFileSync(target, documents.map((doc) => JSON.stringify(doc)).join('\n') + '\n');

process.stdout.write(`Wrote ${documents.length} documents to ${target}\n`);
