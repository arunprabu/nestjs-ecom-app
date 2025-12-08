import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // localhost:3002/orders over POST
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // localhost:3002/orders over GET
  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  // localhost:3002/orders/12345 over GET
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // localhost:3002/orders/12345 over PUT
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  // localhost:3002/orders/12345 over DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id);
    return { success: true };
  }
}
