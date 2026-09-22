import { Body, Controller, Post } from '@nestjs/common';

import { CreatePaymentUseCase } from '../../../application/payment/use-cases/create-payment.use-case';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    const payment = await this.createPaymentUseCase.execute({
      cpf: dto.cpf,
      description: dto.description,
      amountInCents: Math.round(dto.amount * 100),
      paymentMethod: dto.paymentMethod,
    });

    return {
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amountInCents / 100,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    };
  }
}