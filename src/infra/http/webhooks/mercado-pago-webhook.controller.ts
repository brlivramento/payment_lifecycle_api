import {
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import { WebhookSignatureValidator } from 'mercadopago';

import { ProcessProviderPaymentNotificationUseCase } from '../../../application/payment/use-cases/process-provider-payment-notification.use-case';

@Controller('api/webhooks/mercado-pago')
export class MercadoPagoWebhookController {
  constructor(
    private readonly processProviderPaymentNotificationUseCase: ProcessProviderPaymentNotificationUseCase,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Headers('x-signature') xSignature: string | undefined,
    @Headers('x-request-id') xRequestId: string | undefined,
    @Query('data.id') dataId: string | undefined,
  ) {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (!secret || !xSignature || !xRequestId || !dataId) {
      throw new ForbiddenException('Invalid Mercado Pago webhook');
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret,
      });
    } catch {
      throw new ForbiddenException('Invalid Mercado Pago webhook signature');
    }

    await this.processProviderPaymentNotificationUseCase.execute(dataId);

    return { received: true };
  }
}