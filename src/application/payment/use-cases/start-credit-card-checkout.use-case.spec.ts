import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import {
  CreditCardCheckout,
  CreditCardCheckoutGateway,
  CreateCreditCardCheckoutInput,
} from '../ports/credit-card-checkout.gateway';
import {
  ListPaymentsFilters,
  PaymentRepository,
} from '../ports/payment-repository';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { StartCreditCardCheckoutUseCase } from './start-credit-card-checkout.use-case';

class InMemoryPaymentRepository implements PaymentRepository {
  public payments: Payment[] = [];

  async save(payment: Payment): Promise<void> {
    this.payments.push(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.find((payment) => payment.id === id) ?? null;
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return (
      this.payments.find(
        (payment) => payment.idempotencyKey === key,
      ) ?? null
    );
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
}

class FakeCreditCardCheckoutGateway implements CreditCardCheckoutGateway {
  public calls = 0;

  async create(
    _input: CreateCreditCardCheckoutInput,
  ): Promise<CreditCardCheckout> {
    this.calls += 1;

    return {
      providerPreferenceId: 'preference-123',
      checkoutUrl: 'https://sandbox.mercadopago.com/checkout/test',
    };
  }
}

describe('StartCreditCardCheckoutUseCase', () => {
  it('creates and stores a checkout preference for credit card payment', async () => {
    const repository = new InMemoryPaymentRepository();
    const gateway = new FakeCreditCardCheckoutGateway();
    const createPaymentUseCase = new CreatePaymentUseCase(repository);
    const useCase = new StartCreditCardCheckoutUseCase(
      repository,
      gateway,
    );

    const payment = await createPaymentUseCase.execute({
      idempotencyKey: 'credit-card-test-001',
      cpf: '12345678901',
      description: 'Pagamento com cartão',
      amountInCents: 2590,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    const result = await useCase.execute(payment.id);

    expect(result?.providerPreferenceId).toBe('preference-123');
    expect(result?.checkoutUrl).toBe(
      'https://sandbox.mercadopago.com/checkout/test',
    );
    expect(gateway.calls).toBe(1);
  });

  it('does not create another checkout when it already exists', async () => {
    const repository = new InMemoryPaymentRepository();
    const gateway = new FakeCreditCardCheckoutGateway();
    const createPaymentUseCase = new CreatePaymentUseCase(repository);
    const useCase = new StartCreditCardCheckoutUseCase(
      repository,
      gateway,
    );

    const payment = await createPaymentUseCase.execute({
      idempotencyKey: 'credit-card-test-002',
      cpf: '12345678901',
      description: 'Pagamento com cartão',
      amountInCents: 2590,
      paymentMethod: PaymentMethod.CREDIT_CARD,
    });

    await useCase.execute(payment.id);
    await useCase.execute(payment.id);

    expect(gateway.calls).toBe(1);
  });
});