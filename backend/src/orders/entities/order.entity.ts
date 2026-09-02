import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

export class OrderLine {
  @ApiProperty({ type: Product })
  product!: Product;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 'M', required: false })
  size?: string;

  @ApiProperty({ example: 199.98, description: 'discountedPrice multiplied by quantity' })
  lineTotal!: number;
}

export class Order {
  @ApiProperty({ example: 'RD-8F3A21' })
  id!: string;

  @ApiProperty({ type: [OrderLine] })
  items!: OrderLine[];

  @ApiProperty({ example: 4 })
  itemCount!: number;

  @ApiProperty({ example: 439.96 })
  subtotal!: number;

  @ApiProperty({ example: 40.0, description: 'Total saved versus the full price' })
  savings!: number;

  @ApiProperty({ example: 439.96 })
  total!: number;

  @ApiProperty({ example: 'customer@example.com', required: false })
  email?: string;

  @ApiProperty({ example: '2026-09-02T10:15:00.000Z' })
  createdAt!: string;
}
