import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { QueryProductsDto } from './dto/query-products.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with optional filtering and sorting' })
  @ApiOkResponse({ type: [Product] })
  findAll(@Query() query: QueryProductsDto): Promise<Product[]> {
    return this.productsService.findAll(query);
  }

  @Get('tags')
  @ApiOperation({ summary: 'List every tag used across the catalogue' })
  @ApiOkResponse({ type: [String] })
  findTags(): Promise<string[]> {
    return this.productsService.findTags();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  @ApiParam({ name: 'id', example: '97e77845-a485-4301-827f-51b673d4230f' })
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'Product does not exist' })
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }
}
