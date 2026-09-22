import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import { PaymentRepository } from '../ports/payment-repository';
import { CreatePaymentUseCase } from './create-payment.use-case';

class InMemoryPaymentRepository implements PaymentRepository {
  public payments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments.push(payment);
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return (
      this.payments.find(
        (payment) => payment.idempotencyKey === key,
      ) ?? null
    );
  }
}

describe('CreatePaymentUseCase', () => {
  it('returns the existing payment when idempotency key is reused', async () => {
    const repository = new InMemoryPaymentRepository();
    const useCase = new CreatePaymentUseCase(repository);

    const input = {
      idempotencyKey: 'same-request-key-001',
      cpf: '12345678901',
      description: 'Pagamento idempotente',
      amountInCents: 4990,
      paymentMethod: PaymentMethod.PIX,
    };

    const firstPayment = await useCase.execute(input);
    const secondPayment = await useCase.execute(input);

    expect(secondPayment.id).toBe(firstPayment.id);
    expect(repository.payments).toHaveLength(1);
  });
});