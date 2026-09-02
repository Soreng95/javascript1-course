import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { SanityModule } from './sanity/sanity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SanityModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
