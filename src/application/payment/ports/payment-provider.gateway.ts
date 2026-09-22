export interface ProviderPayment {
  externalReference: string;
  status: string;
}

export interface PaymentProviderGateway {
  getPayment(providerPaymentId: string): Promise<ProviderPayment | null>;
}