export interface CreateCreditCardCheckoutInput {
  paymentId: string;
  description: string;
  amountInCents: number;
  cpf: string;
}

export interface CreditCardCheckout {
  providerPreferenceId: string;
  checkoutUrl: string;
}

export interface CreditCardCheckoutGateway {
  create(
    input: CreateCreditCardCheckoutInput,
  ): Promise<CreditCardCheckout>;
}