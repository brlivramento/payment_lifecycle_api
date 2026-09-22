import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PaymentMethod } from '../../../../domain/payment/enums/payment-method.enum';
import { IsCpf } from '../validators/is-cpf.decorator';

export class ListPaymentsDto {
  @ApiPropertyOptional({
    example: '52998224725',
    description: 'Filtra pagamentos pelo CPF do cliente',
  })
  @IsOptional()
  @IsCpf()
  cpf?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
    description: 'Filtra pagamentos pelo meio de pagamento',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}