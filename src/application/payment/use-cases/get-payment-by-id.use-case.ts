import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentRepository } from '../ports/payment-repository';

export class GetPaymentByIdUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }
}