import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import {
  CreditCardCheckoutGateway,
} from '../ports/credit-card-checkout.gateway';
import { PaymentRepository } from '../ports/payment-repository';

export class StartCreditCardCheckoutUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly creditCardCheckoutGateway: CreditCardCheckoutGateway,
  ) { }

  async execute(paymentId: string): Promise<Payment | null> {
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      return null;
    }

    if (payment.paymentMethod !== PaymentMethod.CREDIT_CARD) {
      throw new Error('Payment is not a credit card payment');
    }

    if (payment.checkoutUrl) {
      return payment;
    }

    const checkout = await this.creditCardCheckoutGateway.create({
      paymentId: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amountInCents: payment.amountInCents,
    });

    payment.setCreditCardCheckout(
      checkout.providerPreferenceId,
      checkout.checkoutUrl,
    );

    await this.paymentRepository.update(payment);

    return payment;
  }
}