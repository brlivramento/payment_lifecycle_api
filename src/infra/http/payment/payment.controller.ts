import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { CreatePaymentUseCase } from '../../../application/payment/use-cases/create-payment.use-case';
import { GetPaymentByIdUseCase } from '../../../application/payment/use-cases/get-payment-by-id.use-case';
import { ListPaymentsUseCase } from '../../../application/payment/use-cases/list-payments.use-case';
import { UpdatePaymentStatusUseCase } from '../../../application/payment/use-cases/update-payment-status.use-case';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsDto } from './dto/list-payments.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    const payment = await this.createPaymentUseCase.execute({
      cpf: dto.cpf,
      description: dto.description,
      amountInCents: Math.round(dto.amount * 100),
      paymentMethod: dto.paymentMethod,
    });

    return this.present(payment);
  }

  @Get()
  async list(@Query() filters: ListPaymentsDto) {
    const payments = await this.listPaymentsUseCase.execute(filters);

    return payments.map((payment) => this.present(payment));
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const payment = await this.getPaymentByIdUseCase.execute(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.present(payment);
  }

  @Put(':id')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.updatePaymentStatusUseCase.execute(
      id,
      dto.status,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.present(payment);
  }

  private present(payment: {
    id: string;
    cpf: string;
    description: string;
    amountInCents: number;
    paymentMethod: string;
    status: string;
  }) {
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