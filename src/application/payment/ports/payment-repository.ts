import { Payment } from '../../../domain/payment/entities/payment';

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
}