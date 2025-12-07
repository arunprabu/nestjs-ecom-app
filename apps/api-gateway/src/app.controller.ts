import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const PRODUCTS_BASE = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';
const ORDERS_BASE = process.env.ORDERS_SERVICE_URL || 'http://localhost:3002';

@Controller()
export class AppController {
  constructor(private readonly http: HttpService) { }

  // Products proxy
  @Get('api/products')
  async getProducts() {
    // Forward to Products service
    const result = await firstValueFrom(
      this.http.get('http://localhost:3001/products')
    );
    return result.data;
  }

  @Get('api/products/:id')
  async getProductById(@Param('id') id: string) {
    const result = await firstValueFrom(this.http.get(`${PRODUCTS_BASE}/products/${id}`));
    return result.data;
  }

  @Post('api/products')
  async createProduct(@Body() body: any) {
    const result = await firstValueFrom(this.http.post(`${PRODUCTS_BASE}/products`, body));
    return result.data;
  }

  @Put('api/products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const result = await firstValueFrom(this.http.put(`${PRODUCTS_BASE}/products/${id}`, body));
    return result.data;
  }

  @Delete('api/products/:id')
  async deleteProduct(@Param('id') id: string) {
    const result = await firstValueFrom(this.http.delete(`${PRODUCTS_BASE}/products/${id}`));
    return result.data;
  }

  // Orders proxy
  @Post('api/orders')
  async createOrder(@Body() body: any) {
    const result = await firstValueFrom(this.http.post(`${ORDERS_BASE}/orders`, body));
    return result.data;
  }

  @Get('api/orders')
  async getOrders(@Query() query: any) {
    const qs = Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '';
    const result = await firstValueFrom(this.http.get(`${ORDERS_BASE}/orders${qs}`));
    return result.data;
  }

  @Get('api/orders/:id')
  async getOrderById(@Param('id') id: string) {
    const result = await firstValueFrom(this.http.get(`${ORDERS_BASE}/orders/${id}`));
    return result.data;
  }

  @Put('api/orders/:id')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    const result = await firstValueFrom(this.http.put(`${ORDERS_BASE}/orders/${id}`, body));
    return result.data;
  }

  @Delete('api/orders/:id')
  async deleteOrder(@Param('id') id: string) {
    const result = await firstValueFrom(this.http.delete(`${ORDERS_BASE}/orders/${id}`));
    return result.data;
  }
}
