import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import {
  ListPaymentsFilters,
  PaymentRepository,
} from '../ports/payment-repository';
import {
  PaymentProviderGateway,
  ProviderPayment,
} from '../ports/payment-provider.gateway';
import { ProcessProviderPaymentNotificationUseCase } from './process-provider-payment-notification.use-case';

class InMemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, Payment>();

  public updatedPayments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.get(id) ?? null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Payment | null> {
    return (
      [...this.payments.values()].find(
        (payment) => payment.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async list(_filters: ListPaymentsFilters): Promise<Payment[]> {
    return [...this.payments.values()];
  }

  async update(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment);
    this.updatedPayments.push(payment);
  }
}

class FakePaymentProviderGateway implements PaymentProviderGateway {
  public payment: ProviderPayment | null = null;

  async getPayment(_providerPaymentId: string): Promise<ProviderPayment | null> {
    return this.payment;
  }
}

describe('ProcessProviderPaymentNotificationUseCase', () => {
  let paymentRepository: InMemoryPaymentRepository;
  let paymentProviderGateway: FakePaymentProviderGateway;
  let useCase: ProcessProviderPaymentNotificationUseCase;

  beforeEach(() => {
    paymentRepository = new InMemoryPaymentRepository();
    paymentProviderGateway = new FakePaymentProviderGateway();

    useCase = new ProcessProviderPaymentNotificationUseCase(
      paymentRepository,
      paymentProviderGateway,
    );
  });

  it('updates a payment to PAID when Mercado Pago approves it', async () => {
    const payment = new Payment({
      id: 'payment-1',
      idempotencyKey: 'payment-key-1',
      providerPreferenceId: 'preference-1',
      checkoutUrl: 'https://example.com/checkout',
      cpf: '52998224725',
      description: 'Pagamento de teste',
      amountInCents: 1234,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await paymentRepository.save(payment);

    paymentProviderGateway.payment = {
      externalReference: payment.id,
      status: 'approved',
    };

    const result = await useCase.execute('provider-payment-1');

    expect(result?.status).toBe(PaymentStatus.PAID);
    expect(paymentRepository.updatedPayments).toHaveLength(1);
  });

  it('updates a payment to FAIL when Mercado Pago rejects it', async () => {
    const payment = new Payment({
      id: 'payment-2',
      idempotencyKey: 'payment-key-2',
      providerPreferenceId: 'preference-2',
      checkoutUrl: 'https://example.com/checkout',
      cpf: '52998224725',
      description: 'Pagamento recusado',
      amountInCents: 1234,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await paymentRepository.save(payment);

    paymentProviderGateway.payment = {
      externalReference: payment.id,
      status: 'rejected',
    };

    const result = await useCase.execute('provider-payment-2');

    expect(result?.status).toBe(PaymentStatus.FAIL);
    expect(paymentRepository.updatedPayments).toHaveLength(1);
  });

  it('ignores a provider payment that does not exist', async () => {
    paymentProviderGateway.payment = null;

    const result = await useCase.execute('unknown-provider-payment');

    expect(result).toBeNull();
    expect(paymentRepository.updatedPayments).toHaveLength(0);
  });
});