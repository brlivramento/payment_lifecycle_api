import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';
import { IsCpf } from '../validators/is-cpf.decorator';

export class CreatePaymentDto {
  @ApiProperty({
    example: '52998224725',
    description: 'CPF do cliente, somente números',
  })
  @IsCpf()
  cpf: string;

  @ApiProperty({
    example: 'Cobrança referente ao pedido #123',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 49.9,
    description: 'Valor da cobrança em reais',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}