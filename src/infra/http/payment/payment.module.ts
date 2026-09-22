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
import { ListPaymentsUseCase } from '../../../application/payment/use-cases/list-payments.use-case';
import { UpdatePaymentStatusUseCase } from '../../../application/payment/use-cases/update-payment-status.use-case';
import { StartCreditCardCheckoutUseCase } from '../../../application/payment/use-cases/start-credit-card-checkout.use-case';
import {
  CreditCardCheckoutGateway,
} from '../../../application/payment/ports/credit-card-checkout.gateway';
import {
  CREDIT_CARD_CHECKOUT_GATEWAY,
} from '../../../application/payment/ports/credit-card-checkout.gateway.token';
import { MercadoPagoCreditCardCheckoutGateway } from '../../payment-gateways/mercado-pago/mercado-pago-credit-card-checkout.gateway';

import { ProcessProviderPaymentNotificationUseCase } from '../../../application/payment/use-cases/process-provider-payment-notification.use-case';
import {
  PaymentProviderGateway,
} from '../../../application/payment/ports/payment-provider.gateway';
import {
  PAYMENT_PROVIDER_GATEWAY,
} from '../../../application/payment/ports/payment-provider.gateway.token';

import { MercadoPagoWebhookController } from '../webhooks/mercado-pago-webhook.controller';

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
    {
      provide: ListPaymentsUseCase,
      useFactory: (paymentRepository: PaymentRepository) => {
        return new ListPaymentsUseCase(paymentRepository);
      },
      inject: [PAYMENT_REPOSITORY],
    },
    {
      provide: UpdatePaymentStatusUseCase,
      useFactory: (paymentRepository: PaymentRepository) => {
        return new UpdatePaymentStatusUseCase(paymentRepository);
      },
      inject: [PAYMENT_REPOSITORY],
    },
    MercadoPagoCreditCardCheckoutGateway,
    {
      provide: CREDIT_CARD_CHECKOUT_GATEWAY,
      useExisting: MercadoPagoCreditCardCheckoutGateway,
    },
    {
      provide: StartCreditCardCheckoutUseCase,
      useFactory: (
        paymentRepository: PaymentRepository,
        creditCardCheckoutGateway: CreditCardCheckoutGateway,
      ) => {
        return new StartCreditCardCheckoutUseCase(
          paymentRepository,
          creditCardCheckoutGateway,
        );
      },
      inject: [PAYMENT_REPOSITORY, CREDIT_CARD_CHECKOUT_GATEWAY],
    },
    {
      provide: PAYMENT_PROVIDER_GATEWAY,
      useExisting: MercadoPagoCreditCardCheckoutGateway,
    },
    {
      provide: ProcessProviderPaymentNotificationUseCase,
      useFactory: (
        paymentRepository: PaymentRepository,
        paymentProviderGateway: PaymentProviderGateway,
      ) => {
        return new ProcessProviderPaymentNotificationUseCase(
          paymentRepository,
          paymentProviderGateway,
        );
      },
      inject: [PAYMENT_REPOSITORY, PAYMENT_PROVIDER_GATEWAY],
    },
  ],
  exports: [CreatePaymentUseCase, GetPaymentByIdUseCase, ListPaymentsUseCase, UpdatePaymentStatusUseCase, StartCreditCardCheckoutUseCase, ProcessProviderPaymentNotificationUseCase,],
  controllers: [PaymentController, MercadoPagoWebhookController],
})
export class PaymentModule { }