import { ProductsService } from './products.service';
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  // localhost:3001/products over GET
  @Get()
  async getAll() {
    console.log("=========GETTING ALL PRODUCTS IN CONTROLLER");
    return this.productsService.findAll();
  }

  // localhost:3001/products/12345 over GET
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // localhost:3001/products over POST
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // localhost:3001/products/12345 over PUT
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  // localhost:3001/products/12345 over DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { success: true };
  }
}
