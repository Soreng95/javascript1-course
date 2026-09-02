import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a simulated order and receive a confirmation' })
  @ApiCreatedResponse({ type: Order })
  @ApiBadRequestResponse({ description: 'Invalid basket contents' })
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a previously placed order' })
  @ApiParam({ name: 'id', example: 'RD-8F3A21' })
  @ApiOkResponse({ type: Order })
  @ApiNotFoundResponse({ description: 'Order does not exist' })
  findOne(@Param('id') id: string): Order {
    return this.ordersService.findOne(id);
  }
}
