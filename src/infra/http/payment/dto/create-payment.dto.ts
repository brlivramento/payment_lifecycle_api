import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { IsCpf } from '../validators/is-cpf.decorator';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';

export class CreatePaymentDto {
  @IsCpf()
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