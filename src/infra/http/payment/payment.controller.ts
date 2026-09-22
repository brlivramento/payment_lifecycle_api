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
  BadRequestException,
  Headers,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';

import { CreatePaymentUseCase } from '../../../application/payment/use-cases/create-payment.use-case';
import { GetPaymentByIdUseCase } from '../../../application/payment/use-cases/get-payment-by-id.use-case';
import { ListPaymentsUseCase } from '../../../application/payment/use-cases/list-payments.use-case';
import { UpdatePaymentStatusUseCase } from '../../../application/payment/use-cases/update-payment-status.use-case';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsDto } from './dto/list-payments.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { StartCreditCardCheckoutUseCase } from '../../../application/payment/use-cases/start-credit-card-checkout.use-case';

@ApiTags('Payments')
@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly updatePaymentStatusUseCase: UpdatePaymentStatusUseCase,
    private readonly startCreditCardCheckoutUseCase: StartCreditCardCheckoutUseCase,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo pagamento' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description: 'Chave única que identifica uma tentativa de criação de pagamento.',
    example: '0b4b2ca6-9706-4c51-8446-35fed8e50450',
  })
  @ApiResponse({ status: 201, description: 'Pagamento criado como PENDING.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  async create(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() dto: CreatePaymentDto,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    let payment = await this.createPaymentUseCase.execute({
      idempotencyKey,
      cpf: dto.cpf,
      description: dto.description,
      amountInCents: Math.round(dto.amount * 100),
      paymentMethod: dto.paymentMethod,
    });

    if (payment.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const paymentWithCheckout =
        await this.startCreditCardCheckoutUseCase.execute(payment.id);

      if (!paymentWithCheckout) {
        throw new NotFoundException('Payment not found');
      }

      payment = paymentWithCheckout;
    }

    return this.present(payment);
  }

  @Get()
  @ApiOperation({ summary: 'Lista pagamentos com filtros opcionais' })
  @ApiQuery({ name: 'cpf', required: false, example: '52998224725' })
  @ApiQuery({
    name: 'paymentMethod',
    required: false,
    enum: PaymentMethod,
  })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos.' })
  async list(@Query() filters: ListPaymentsDto) {
    const payments = await this.listPaymentsUseCase.execute(filters);

    return payments.map((payment) => this.present(payment));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pagamento pelo ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const payment = await this.getPaymentByIdUseCase.execute(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.present(payment);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza o status de um pagamento' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status atualizado.' })
  @ApiResponse({ status: 400, description: 'Status ou ID inválido.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
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
    checkoutUrl: string | null;
  }) {
    return {
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amountInCents / 100,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      ...(payment.checkoutUrl ? { checkoutUrl: payment.checkoutUrl } : {}),
    };
  }
}