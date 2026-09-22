import { IsEnum, IsOptional } from 'class-validator';
import { IsCpf } from '../validators/is-cpf.decorator';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';

export class ListPaymentsDto {
  @IsOptional()
  @IsCpf()
  cpf?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}