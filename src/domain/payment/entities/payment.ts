import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentProps {
  id: string;
  idempotencyKey: string | null;
  cpf: string;
  description: string;
  amountInCents: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Payment {
  private props: PaymentProps;

  constructor(props: PaymentProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get idempotencyKey(): string | null {
    return this.props.idempotencyKey;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get description(): string {
    return this.props.description;
  }

  get amountInCents(): number {
    return this.props.amountInCents;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  updateStatus(status: PaymentStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }
}