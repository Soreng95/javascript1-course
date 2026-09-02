import { ApiProperty } from '@nestjs/swagger';

export class ProductImage {
  @ApiProperty({ example: 'https://static.noroff.dev/api/rainy-days/1-m83-jacket.jpg' })
  url!: string;

  @ApiProperty({ example: 'A black jacket with a white logo on it' })
  alt!: string;
}

export class Product {
  @ApiProperty({ example: '97e77845-a485-4301-827f-51b673d4230f' })
  id!: string;

  @ApiProperty({ example: 'Rainy Days M83 Jacket' })
  title!: string;

  @ApiProperty({ example: 'The Women\'s Rainy Days M83 jacket delivers waterproof protection.' })
  description!: string;

  @ApiProperty({ example: 'Female', enum: ['Male', 'Female'] })
  gender!: string;

  @ApiProperty({ example: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], type: [String] })
  sizes!: string[];

  @ApiProperty({ example: 'Black' })
  baseColor!: string;

  @ApiProperty({ example: 109.99 })
  price!: number;

  @ApiProperty({ example: 99.99 })
  discountedPrice!: number;

  @ApiProperty({ example: true })
  onSale!: boolean;

  @ApiProperty({ type: ProductImage })
  image!: ProductImage;

  @ApiProperty({ example: ['jacket', 'womens'], type: [String] })
  tags!: string[];

  @ApiProperty({ example: false })
  favorite!: boolean;
}
