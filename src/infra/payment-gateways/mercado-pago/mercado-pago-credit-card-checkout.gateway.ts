import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import {
  PaymentProviderGateway,
  ProviderPayment,
} from '../../../application/payment/ports/payment-provider.gateway';

import {
  CreditCardCheckout,
  CreditCardCheckoutGateway,
  CreateCreditCardCheckoutInput,
} from '../../../application/payment/ports/credit-card-checkout.gateway';

@Injectable()
export class MercadoPagoCreditCardCheckoutGateway
  implements CreditCardCheckoutGateway, PaymentProviderGateway {
  private readonly preference: Preference;
  private readonly payment: Payment;
  private readonly webhookUrl: string;

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
    }

    const webhookUrl = process.env.MERCADO_PAGO_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error('MERCADO_PAGO_WEBHOOK_URL is not defined');
    }

    this.webhookUrl = webhookUrl;

    const client = new MercadoPagoConfig({ accessToken });

    this.preference = new Preference(client);
    this.payment = new Payment(client);
  }

  async create(
    input: CreateCreditCardCheckoutInput,
  ): Promise<CreditCardCheckout> {
    const preference = await this.preference.create({
      body: {
        external_reference: input.paymentId,
        notification_url: this.webhookUrl,
        items: [
          {
            id: input.paymentId,
            title: input.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: input.amountInCents / 100,
          },
        ],
      },
    });

    const providerPreferenceId = preference.id;
    const checkoutUrl = preference.sandbox_init_point ?? preference.init_point;

    if (!providerPreferenceId || !checkoutUrl) {
      throw new Error(
        'Mercado Pago did not return preference id or checkout URL',
      );
    }

    return {
      providerPreferenceId,
      checkoutUrl,
    };
  }

  async getPayment(
    providerPaymentId: string,
  ): Promise<ProviderPayment | null> {
    try {
      const payment = await this.payment.get({ id: providerPaymentId });

      if (!payment.external_reference || !payment.status) {
        throw new Error(
          'Mercado Pago did not return external reference or payment status',
        );
      }

      return {
        externalReference: payment.external_reference,
        status: payment.status,
      };
    } catch (error: unknown) {
      const status =
        typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof error.status === 'number'
          ? error.status
          : undefined;

      if (status === 404) {
        return null;
      }

      throw error;
    }
  }
}