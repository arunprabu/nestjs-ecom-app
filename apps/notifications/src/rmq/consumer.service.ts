import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private conn: amqp.Connection | undefined;
  private channel: amqp.Channel | undefined;
  private logger = new Logger(NotificationsConsumer.name);

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    this.conn = await amqp.connect(url);
    this.channel = await this.conn.createChannel();

    await this.channel.assertQueue('ORDER_CREATED', { durable: true });
    await this.channel.assertQueue('ORDER_REJECTED', { durable: true });

    // consume ORDER_CREATED
    await this.channel.consume('ORDER_CREATED', (msg) => {
      if (!msg) return;
      try {
        // ideal place for you to send email or push notification
        // but i am logging to console for demo purposes
        const payload = JSON.parse(msg.content.toString());
        this.logger.log(`ORDER_CREATED received: ${JSON.stringify(payload)}`);
      } catch (err) {
        this.logger.error('Failed to parse ORDER_CREATED message', err as any);
      } finally {
        this.channel?.ack(msg);
      }
    });

    // consume ORDER_REJECTED
    await this.channel.consume('ORDER_REJECTED', (msg) => {
      if (!msg) return;
      try {
        // ideal place for you to send email or push notification
        // but i am logging to console for demo purposes
        const payload = JSON.parse(msg.content.toString());
        this.logger.log(`ORDER_REJECTED received: ${JSON.stringify(payload)}`);
      } catch (err) {
        this.logger.error('Failed to parse ORDER_REJECTED message', err as any);
      } finally {
        this.channel?.ack(msg);
      }
    });

    this.logger.log('NotificationsConsumer connected and consuming ORDER_CREATED and ORDER_REJECTED');
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.conn?.close();
    } catch (err) {
      this.logger.error('Error closing RabbitMQ consumer', err as any);
    }
  }
}
