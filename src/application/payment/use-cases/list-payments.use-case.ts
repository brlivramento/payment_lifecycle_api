import { Payment } from '../../../domain/payment/entities/payment';
import {
  ListPaymentsFilters,
  PaymentRepository,
} from '../ports/payment-repository';

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(filters: ListPaymentsFilters): Promise<Payment[]> {
    return this.paymentRepository.list(filters);
  }
}