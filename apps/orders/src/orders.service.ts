import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrdersRabbitService } from './rmq/rabbitmq.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly httpService: HttpService,
    private readonly rmqService: OrdersRabbitService,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order | { order: Order; rejectedItems: any[] }> {
    // Check stock for each item by calling Products service synchronously (HTTP)
    const productsServiceBase = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';

    const rejectedItems: any[] = [];
    for (const item of createOrderDto.items) {
      try {
        const resp = await firstValueFrom(
          this.httpService.get(`${productsServiceBase}/products/${item.productId}`),
        );
        const product = resp.data;
        // if product missing or insufficient stock -> mark rejected
        if (!product || typeof product.stock !== 'number' || product.stock < item.quantity) {
          rejectedItems.push({ productId: item.productId, available: product?.stock ?? 0 });
        }
      } catch (err) {
        // treat errors (404/connection) as unavailable
        rejectedItems.push({ productId: item.productId, reason: err?.message ?? 'unavailable' });
      }
    }

    // If no rejected items, decrement stock in Products service before saving
    let finalStatus = 'ACCEPTED';

    if (rejectedItems.length === 0) {
      // keep fetched product data to compute new stock
      // Re-fetching is avoided — but earlier checks didn't store products; we'll fetch again to get latest stock
      const failedUpdates: any[] = [];

      for (const item of createOrderDto.items) {
        try {
          // get latest product state
          const resp = await firstValueFrom(
            this.httpService.get(`${productsServiceBase}/products/${item.productId}`),
          );
          const product = resp.data;
          const newStock = (product?.stock ?? 0) - item.quantity;
          // ensure not negative
          if (newStock < 0) {
            failedUpdates.push({ productId: item.productId, available: product?.stock ?? 0 });
            continue;
          }

          // call products update endpoint to set new stock
          await firstValueFrom(
            this.httpService.put(`${productsServiceBase}/products/${item.productId}`, { stock: newStock }),
          );
        } catch (err) {
          failedUpdates.push({ productId: item.productId, reason: err?.message ?? 'update-failed' });
        }
      }

      if (failedUpdates.length > 0) {
        // If any stock updates failed, mark order rejected and report failed updates
        finalStatus = 'REJECTED';
        rejectedItems.push(...failedUpdates);
      }
    } else {
      finalStatus = 'REJECTED';
    }

    const toSave = { ...createOrderDto, status: finalStatus } as any;
    const created = new this.orderModel(toSave);
    const saved = await created.save();

    if (rejectedItems.length > 0) {
      // publish rejected event asynchronously
      try {
        this.rmqService.publish('ORDER_REJECTED', { order: saved, rejectedItems });
      } catch (e) {
        // log and ignore publish errors
      }
      return { order: saved, rejectedItems };
    }

    // publish created event asynchronously
    try {
      this.rmqService.publish('ORDER_CREATED', saved);
    } catch (e) {
      // ignore publish errors
    }

    return saved;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }
    return order;
  }

  async update(id: string, updateDto: UpdateOrderDto): Promise<Order> {
    const updated = await this.orderModel
      .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.orderModel.findByIdAndDelete(id).exec();
    if (!removed) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }
  }
}
