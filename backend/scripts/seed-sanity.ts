import { config as loadEnv } from 'dotenv';
import { createReadStream, existsSync } from 'fs';
import { basename, join, resolve } from 'path';
import { createClient, SanityAssetDocument } from '@sanity/client';
import { PRODUCT_IMAGE_FILES, PRODUCT_SEED } from '../src/data/products.seed';

loadEnv({ path: resolve(__dirname, '..', '.env') });

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? 'production';
const token = process.env.SANITY_TOKEN;

if (!projectId || !token) {
  process.stderr.write(
    'SANITY_PROJECT_ID and SANITY_TOKEN must be set in backend/.env before seeding.\n',
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.SANITY_API_VERSION ?? '2024-01-01',
  useCdn: false,
});

const repoRoot = resolve(__dirname, '..', '..');
const assetCache = new Map<string, string>();

async function uploadLocalImage(relativePath: string): Promise<string> {
  const cached = assetCache.get(relativePath);
  if (cached) return cached;

  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Image not found: ${absolutePath}`);
  }

  const asset: SanityAssetDocument = await client.assets.upload(
    'image',
    createReadStream(absolutePath),
    { filename: basename(absolutePath) },
  );

  assetCache.set(relativePath, asset._id);
  return asset._id;
}

async function uploadRemoteImage(url: string): Promise<string> {
  const cached = assetCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url} (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const asset: SanityAssetDocument = await client.assets.upload('image', buffer, {
    filename: basename(new URL(url).pathname),
  });

  assetCache.set(url, asset._id);
  return asset._id;
}

async function run(): Promise<void> {
  const transaction = client.transaction();
  let uploaded = 0;

  for (const product of PRODUCT_SEED) {
    const localPath = PRODUCT_IMAGE_FILES[product.id];
    const assetId = localPath
      ? await uploadLocalImage(localPath)
      : await uploadRemoteImage(product.image.url);

    uploaded += 1;
    process.stdout.write(`[${uploaded}/${PRODUCT_SEED.length}] ${product.title}\n`);

    transaction.createOrReplace({
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
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
        alt: product.image.alt,
      },
      tags: product.tags,
      favorite: product.favorite,
    });
  }

  await transaction.commit();
  process.stdout.write(`Seeded ${PRODUCT_SEED.length} products into ${projectId}/${dataset}\n`);
}

run().catch((error: Error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
