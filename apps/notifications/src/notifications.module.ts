import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsConsumer } from './rmq/consumer.service';

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer],
})
export class NotificationsModule { }
