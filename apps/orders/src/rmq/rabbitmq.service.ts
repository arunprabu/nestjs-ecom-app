import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class OrdersRabbitService implements OnModuleInit, OnModuleDestroy {
  private conn: amqp.Connection | undefined;
  private channel: amqp.Channel | undefined;
  private logger = new Logger(OrdersRabbitService.name);

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.conn = await amqp.connect(url);
    this.channel = await this.conn.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  async publish(queue: string, payload: any) {
    if (!this.channel) {
      this.logger.error('No AMQP channel available to publish');
      return;
    }
    await this.channel.assertQueue(queue, { durable: true });
    const content = Buffer.from(JSON.stringify(payload));
    // send to queue (non-blocking)
    this.channel.sendToQueue(queue, content, { persistent: true });
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.conn?.close();
    } catch (err) {
      this.logger.error('Error closing rabbitmq', err as any);
    }
  }
}
