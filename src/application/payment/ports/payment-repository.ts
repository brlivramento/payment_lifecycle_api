import { Payment } from '../../../domain/payment/entities/payment';

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
}