import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()

export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  async findAll(): Promise<Product[]> {
    console.log("=========FINDING ALL PRODUCTS IN SERVICE");
    return this.productModel.find().exec();  // similar to select * from products
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const created = new this.productModel(createProductDto);
    return created.save();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.productModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException(`Product with id=${id} not found`);
    }
  }
}
