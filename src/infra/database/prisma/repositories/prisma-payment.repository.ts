import { Injectable } from '@nestjs/common';

import {
  PaymentMethod as PrismaPaymentMethod,
  PaymentStatus as PrismaPaymentStatus,
} from '../../../../generated/prisma/client';
import { Payment } from '../../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../../domain/payment/enums/payment-status.enum';
import {
  ListPaymentsFilters,
  PaymentRepository,
} from '../../../../application/payment/ports/payment-repository';
import { PrismaService } from '../prisma.service';

const paymentMethodMap: Record<PaymentMethod, PrismaPaymentMethod> = {
  [PaymentMethod.PIX]: PrismaPaymentMethod.PIX,
  [PaymentMethod.CREDIT_CARD]: PrismaPaymentMethod.CREDIT_CARD,
};

const paymentStatusMap: Record<PaymentStatus, PrismaPaymentStatus> = {
  [PaymentStatus.PENDING]: PrismaPaymentStatus.PENDING,
  [PaymentStatus.PAID]: PrismaPaymentStatus.PAID,
  [PaymentStatus.FAIL]: PrismaPaymentStatus.FAIL,
};

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) { }

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.create({
      data: {
        id: payment.id,
        idempotencyKey: payment.idempotencyKey,
        cpf: payment.cpf,
        description: payment.description,
        amountInCents: payment.amountInCents,
        paymentMethod: paymentMethodMap[payment.paymentMethod],
        status: paymentStatusMap[payment.status],
      },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return null;
    }

    return new Payment({
      id: payment.id,
      idempotencyKey: payment.idempotencyKey,
      cpf: payment.cpf,
      description: payment.description,
      amountInCents: payment.amountInCents,
      paymentMethod: payment.paymentMethod as PaymentMethod,
      status: payment.status as PaymentStatus,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }

  async list(filters: ListPaymentsFilters): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        ...(filters.cpf ? { cpf: filters.cpf } : {}),
        ...(filters.paymentMethod
          ? {
            paymentMethod: paymentMethodMap[filters.paymentMethod],
          }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map(
      (payment) =>
        new Payment({
          id: payment.id,
          idempotencyKey: payment.idempotencyKey,
          cpf: payment.cpf,
          description: payment.description,
          amountInCents: payment.amountInCents,
          paymentMethod: payment.paymentMethod as PaymentMethod,
          status: payment.status as PaymentStatus,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        }),
    );
  }

  async update(payment: Payment): Promise<void> {
    await this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: paymentStatusMap[payment.status],
      },
    });
  }

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: {
        idempotencyKey: key,
      },
    });

    if (!payment) {
      return null;
    }

    return new Payment({
      id: payment.id,
      idempotencyKey: payment.idempotencyKey,
      cpf: payment.cpf,
      description: payment.description,
      amountInCents: payment.amountInCents,
      paymentMethod: payment.paymentMethod as PaymentMethod,
      status: payment.status as PaymentStatus,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }
}