import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

import {
  CreditCardCheckout,
  CreditCardCheckoutGateway,
  CreateCreditCardCheckoutInput,
} from '../../../application/payment/ports/credit-card-checkout.gateway';

@Injectable()
export class MercadoPagoCreditCardCheckoutGateway
  implements CreditCardCheckoutGateway {
  private readonly preference: Preference;

  constructor() {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not defined');
    }

    const client = new MercadoPagoConfig({ accessToken });

    this.preference = new Preference(client);
  }

  async create(
    input: CreateCreditCardCheckoutInput,
  ): Promise<CreditCardCheckout> {
    const preference = await this.preference.create({
      body: {
        external_reference: input.paymentId,
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
}