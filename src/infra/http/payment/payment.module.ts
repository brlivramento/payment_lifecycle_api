import { Module } from '@nestjs/common';

import { CreatePaymentUseCase } from '../../../application/payment/use-cases/create-payment.use-case';
import {
  PAYMENT_REPOSITORY,
} from '../../../application/payment/ports/payment-repository.token';
import { PaymentRepository } from '../../../application/payment/ports/payment-repository';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { PrismaPaymentRepository } from '../../database/prisma/repositories/prisma-payment.repository';
import { PaymentController } from './payment.controller';
import { GetPaymentByIdUseCase } from '../../../application/payment/use-cases/get-payment-by-id.use-case';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaPaymentRepository,
    {
      provide: PAYMENT_REPOSITORY,
      useExisting: PrismaPaymentRepository,
    },
    {
      provide: CreatePaymentUseCase,
      useFactory: (paymentRepository: PaymentRepository) => {
        return new CreatePaymentUseCase(paymentRepository);
      },
      inject: [PAYMENT_REPOSITORY],
    },
    {
      provide: GetPaymentByIdUseCase,
      useFactory: (paymentRepository: PaymentRepository) => {
        return new GetPaymentByIdUseCase(paymentRepository);
      },
      inject: [PAYMENT_REPOSITORY],
    },
  ],
  exports: [CreatePaymentUseCase, GetPaymentByIdUseCase],
  controllers: [PaymentController],
})
export class PaymentModule {}