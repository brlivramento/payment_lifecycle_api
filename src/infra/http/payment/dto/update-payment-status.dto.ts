import { IsEnum } from 'class-validator';

import { PaymentStatus } from '../../../../domain/payment/enums/payment-status.enum';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}