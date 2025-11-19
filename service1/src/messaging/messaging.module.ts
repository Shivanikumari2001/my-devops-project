import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MessagingController],
})
export class MessagingModule {}


