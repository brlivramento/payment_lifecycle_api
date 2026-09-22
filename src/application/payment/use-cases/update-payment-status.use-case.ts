import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import { PaymentRepository } from '../ports/payment-repository';

export class UpdatePaymentStatusUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(id: string, status: PaymentStatus): Promise<Payment | null> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      return null;
    }

    payment.updateStatus(status);

    await this.paymentRepository.update(payment);

    return payment;
  }
}