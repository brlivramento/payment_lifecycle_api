import { IsEnum, IsOptional, Matches } from 'class-validator';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';

export class ListPaymentsDto {
  @IsOptional()
  @Matches(/^\d{11}$/, {
    message: 'cpf must contain exactly 11 digits',
  })
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}