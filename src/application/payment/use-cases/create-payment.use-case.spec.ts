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
}

describe('CreatePaymentUseCase', () => {
  it('creates a PIX payment with PENDING status', async () => {
    const paymentRepository = new InMemoryPaymentRepository();
    const sut = new CreatePaymentUseCase(paymentRepository);

    const payment = await sut.execute({
      cpf: '12345678909',
      description: 'Pagamento test',
      amountInCents: 15090,
      paymentMethod: PaymentMethod.PIX,
    });

    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect(payment.paymentMethod).toBe(PaymentMethod.PIX);
    expect(paymentRepository.payments).toHaveLength(1);
  });
});