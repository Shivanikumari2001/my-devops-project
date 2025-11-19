import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private service1Client: ClientProxy;

  constructor(private prisma: PrismaService) {
    // TCP client to communicate with Service1
    this.service1Client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE1_HOST || '127.0.0.1',
        port: parseInt(process.env.SERVICE1_TCP_PORT || '3003'),
      },
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // Validate user exists via TCP call to Service1
    try {
      const userValidation = await Promise.race([
        this.service1Client.send('validate_user', { userId: createPaymentDto.userId }).toPromise(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);

      if (!userValidation || !userValidation.success) {
        throw new NotFoundException(`User with ID ${createPaymentDto.userId} not found`);
      }
    } catch (error: any) {
      // If TCP connection fails or times out, allow payment creation anyway
      // In production, you might want to throw an error here
      if (error instanceof NotFoundException) {
        throw error; // Re-throw if user not found
      }
      console.warn('TCP connection to Service1 failed or timed out, allowing payment creation:', error.message);
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId: createPaymentDto.userId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'USD',
        description: createPaymentDto.description,
        status: 'pending',
      },
    });

    // Simulate payment processing
    setTimeout(async () => {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed' },
      });
    }, 2000);

    return payment;
  }

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByUserId(userId: number) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async remove(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: `Payment with ID ${id} has been deleted` };
  }
}


