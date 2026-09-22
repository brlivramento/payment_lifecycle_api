import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import { PaymentProviderGateway } from '../ports/payment-provider.gateway';
import { PaymentRepository } from '../ports/payment-repository';

export class ProcessProviderPaymentNotificationUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProviderGateway: PaymentProviderGateway,
  ) { }

  async execute(providerPaymentId: string): Promise<Payment | null> {
    const providerPayment = await this.paymentProviderGateway.getPayment(
      providerPaymentId,
    );

    if (!providerPayment) {
      return null;
    }

    const payment = await this.paymentRepository.findById(
      providerPayment.externalReference,
    );

    if (!payment) {
      return null;
    }

    const newStatus = this.mapStatus(providerPayment.status);

    if (newStatus && payment.status !== newStatus) {
      payment.updateStatus(newStatus);
      await this.paymentRepository.update(payment);
    }

    return payment;
  }

  private mapStatus(providerStatus: string): PaymentStatus | null {
    switch (providerStatus) {
      case 'approved':
        return PaymentStatus.PAID;

      case 'rejected':
      case 'cancelled':
        return PaymentStatus.FAIL;

      default:
        return null;
    }
  }
}