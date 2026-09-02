import { Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_SEED } from '../data/products.seed';
import { ALL_PRODUCTS_QUERY, PRODUCT_BY_ID_QUERY } from '../sanity/sanity.queries';
import { SanityService } from '../sanity/sanity.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly sanity: SanityService) {}

  async findAll(query: QueryProductsDto): Promise<Product[]> {
    const products = await this.loadAll();
    return this.applyQuery(products, query);
  }

  async findOne(id: string): Promise<Product> {
    if (this.sanity.isEnabled) {
      const fromSanity = await this.sanity.fetch<Product | null>(PRODUCT_BY_ID_QUERY, { id });
      if (fromSanity) return fromSanity;
    }

    const product = PRODUCT_SEED.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException(`No product found with id "${id}"`);
    }

    return product;
  }

  async findTags(): Promise<string[]> {
    const products = await this.loadAll();
    const tags = new Set(products.flatMap((product) => product.tags ?? []));
    return [...tags].sort();
  }

  private async loadAll(): Promise<Product[]> {
    if (this.sanity.isEnabled) {
      const fromSanity = await this.sanity.fetch<Product[]>(ALL_PRODUCTS_QUERY);
      if (fromSanity && fromSanity.length > 0) return fromSanity;
    }

    return PRODUCT_SEED;
  }

  private applyQuery(products: Product[], query: QueryProductsDto): Product[] {
    const { gender, tag, baseColor, size, onSale, search, sort, order, limit } = query;
    let result = [...products];

    if (gender) {
      result = result.filter((product) => product.gender?.toLowerCase() === gender.toLowerCase());
    }

    if (tag) {
      result = result.filter((product) =>
        (product.tags ?? []).some((value) => value.toLowerCase() === tag.toLowerCase()),
      );
    }

    if (baseColor) {
      result = result.filter(
        (product) => product.baseColor?.toLowerCase() === baseColor.toLowerCase(),
      );
    }

    if (size) {
      result = result.filter((product) =>
        (product.sizes ?? []).some((value) => value.toLowerCase() === size.toLowerCase()),
      );
    }

    if (onSale !== undefined) {
      result = result.filter((product) => product.onSale === onSale);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      );
    }

    const sortKey = sort ?? 'title';
    const direction = order === 'desc' ? -1 : 1;

    result.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }

      return String(left).localeCompare(String(right)) * direction;
    });

    return limit ? result.slice(0, limit) : result;
  }
}
