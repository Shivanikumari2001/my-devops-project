import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';

@Controller()
export class MessagingController {
  constructor(private usersService: UsersService) {}

  @MessagePattern('get_user')
  async getUser(@Payload() data: { userId: number }) {
    try {
      const user = await this.usersService.findOne(data.userId);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('validate_user')
  async validateUser(@Payload() data: { userId: number }) {
    try {
      const user = await this.usersService.validateUser(data.userId);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}


