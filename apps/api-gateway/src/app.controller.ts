import { Controller, Get, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly http: HttpService) { }

  @Get('products')
  async getProducts() {
    // Forward to Products service
    const result = await firstValueFrom(
      this.http.get('http://localhost:3001/products')
    );
    return result.data;
  }

  @Post('products')
  async createProduct(@Body() body: any) {
    const result = await firstValueFrom(
      this.http.post('http://localhost:3001/products', body)
    );
    return result.data;
  }
}
