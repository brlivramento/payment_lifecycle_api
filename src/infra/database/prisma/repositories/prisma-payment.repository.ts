import { Injectable } from '@nestjs/common';

import {
  PaymentMethod as PrismaPaymentMethod,
  PaymentStatus as PrismaPaymentStatus,
} from '../../../../generated/prisma/client';
import { Payment } from '../../../../domain/payment/entities/payment';
import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../../domain/payment/enums/payment-status.enum';
import { PaymentRepository } from '../../../../application/payment/ports/payment-repository';
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
  constructor(private readonly prisma: PrismaService) {}

  async save(payment: Payment): Promise<void> {
    await this.prisma.payment.create({
      data: {
        id: payment.id,
        cpf: payment.cpf,
        description: payment.description,
        amountInCents: payment.amountInCents,
        paymentMethod: paymentMethodMap[payment.paymentMethod],
        status: paymentStatusMap[payment.status],
      },
    });
  }
}