import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';

export class CreatePaymentDto {
  @Matches(/^\d{11}$/, {
    message: 'cpf must contain exactly 11 digits',
  })
  cpf: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}