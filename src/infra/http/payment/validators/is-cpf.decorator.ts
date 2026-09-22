import { registerDecorator, ValidationOptions } from 'class-validator';

function isValidCpf(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{11}$/.test(value)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);

  const calculateDigit = (length: number): number => {
    const sum = digits
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * (length + 1 - index), 0);

    const remainder = (sum * 10) % 11;

    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === digits[9] &&
    calculateDigit(10) === digits[10]
  );
}

export function IsCpf(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isCpf',
      target: target.constructor,
      propertyName,
      options: {
        message: 'cpf must be a valid CPF',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return isValidCpf(value);
        },
      },
    });
  };
}