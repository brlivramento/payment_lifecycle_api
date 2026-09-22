import { randomUUID } from 'node:crypto';

import { Payment } from '../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../domain/payment/enums/payment-status.enum';
import { PaymentRepository } from '../ports/payment-repository';

interface CreatePaymentInput {
  idempotencyKey: string;
  cpf: string;
  description: string;
  amountInCents: number;
  paymentMethod: PaymentMethod;
}

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) { }

  async execute(input: CreatePaymentInput): Promise<Payment> {
    const now = new Date();

    const existingPayment =
      await this.paymentRepository.findByIdempotencyKey(input.idempotencyKey);

    if (existingPayment) {
      return existingPayment;
    }

    const payment = new Payment({
      id: randomUUID(),
      idempotencyKey: input.idempotencyKey,
      providerPreferenceId: null,
      checkoutUrl: null,
      cpf: input.cpf,
      description: input.description,
      amountInCents: input.amountInCents,
      paymentMethod: input.paymentMethod,
      status: PaymentStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });

    await this.paymentRepository.save(payment);

    return payment;
  }
}