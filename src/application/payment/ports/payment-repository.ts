import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';

export interface ListPaymentsFilters {
  cpf?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  list(filters: ListPaymentsFilters): Promise<Payment[]>;
  update(payment: Payment): Promise<void>;
}