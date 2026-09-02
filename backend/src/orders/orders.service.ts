import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderLine } from './entities/order.entity';

@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, Order>();

  constructor(private readonly productsService: ProductsService) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const items: OrderLine[] = [];

    for (const item of dto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (item.size && !product.sizes.includes(item.size)) {
        throw new BadRequestException(
          `Size "${item.size}" is not available for "${product.title}"`,
        );
      }

      items.push({
        product,
        quantity: item.quantity,
        size: item.size,
        lineTotal: this.round(product.discountedPrice * item.quantity),
      });
    }

    const subtotal = this.round(items.reduce((sum, line) => sum + line.lineTotal, 0));
    const fullPrice = this.round(
      items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    );

    const order: Order = {
      id: this.generateId(),
      items,
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      savings: this.round(fullPrice - subtotal),
      total: subtotal,
      email: dto.email,
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  findOne(id: string): Order {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`No order found with id "${id}"`);
    }

    return order;
  }

  private generateId(): string {
    return `RD-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
