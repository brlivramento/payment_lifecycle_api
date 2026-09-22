import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import {
  ListPaymentsFilters,
  PaymentRepository,
} from '../ports/payment-repository';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { UpdatePaymentStatusUseCase } from './update-payment-status.use-case';

class InMemoryPaymentRepository implements PaymentRepository {
  public payments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments.push(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.find((payment) => payment.id === id) ?? null;
  }

  async list(filters: ListPaymentsFilters): Promise<Payment[]> {
    return this.payments.filter((payment) => {
      const matchesCpf = !filters.cpf || payment.cpf === filters.cpf;
      const matchesMethod =
        !filters.paymentMethod ||
        payment.paymentMethod === filters.paymentMethod;

      return matchesCpf && matchesMethod;
    });
  }

  async update(payment: Payment): Promise<void> {
    const index = this.payments.findIndex(
      (storedPayment) => storedPayment.id === payment.id,
    );

    if (index >= 0) {
      this.payments[index] = payment;
    }
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return (
      this.payments.find(
        (payment) => payment.idempotencyKey === key,
      ) ?? null
    );
  }
}

describe('UpdatePaymentStatusUseCase', () => {
  it('updates an existing payment status', async () => {
    const repository = new InMemoryPaymentRepository();
    const createPaymentUseCase = new CreatePaymentUseCase(repository);
    const updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(
      repository,
    );

    const createdPayment = await createPaymentUseCase.execute({
      idempotencyKey: 'test-update-payment-001',
      cpf: '12345678901',
      description: 'Pagamento de teste',
      amountInCents: 4990,
      paymentMethod: PaymentMethod.PIX,
    });

    const updatedPayment = await updatePaymentStatusUseCase.execute(
      createdPayment.id,
      PaymentStatus.PAID,
    );

    expect(updatedPayment?.status).toBe(PaymentStatus.PAID);
  });

  it('returns null when payment does not exist', async () => {
    const repository = new InMemoryPaymentRepository();
    const useCase = new UpdatePaymentStatusUseCase(repository);

    const payment = await useCase.execute(
      '00000000-0000-4000-8000-000000000001',
      PaymentStatus.PAID,
    );

    expect(payment).toBeNull();
  });
});