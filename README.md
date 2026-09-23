# Payment Lifecycle API

REST API for managing payment lifecycles with PIX and credit card payments.

Credit card payments use Mercado Pago Checkout Pro. Payment status updates are handled through validated webhooks.

## Stack

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-009EE3?style=for-the-badge&logo=mercadopago&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

## Architecture

```mermaid
flowchart LR
  HTTP["HTTP / Swagger"] --> APP["Application / Use Cases"]
  APP --> DOMAIN["Domain / Business Rules"]
  APP --> INFRA["Infrastructure"]
  INFRA --> DB[("PostgreSQL")]
  INFRA --> MP["Mercado Pago"]
```

## Run locally

Create your environment file:

```bash
cp .env.example .env
```

Configure the required values:

```env
DATABASE_URL="postgresql://payments:payments@postgres:5432/payments?schema=public"

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_WEBHOOK_URL=
```

Start the application:

```bash
docker compose up --build
```

Run database migrations:

```bash
docker compose exec api npx prisma migrate dev
```

- API: `http://localhost:3000`
- Health: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api/docs`

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/payment` | Create a payment |
| `GET` | `/api/payment` | List payments |
| `GET` | `/api/payment/:id` | Get payment by ID |
| `PUT` | `/api/payment/:id` | Update payment status |

## Provider callback

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/webhooks/mercado-pago` | Internal Mercado Pago webhook callback |

## Create a PIX payment

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pix-payment-001" \
  -d '{
    "cpf": "52998224725",
    "description": "PIX payment",
    "amount": 35.50,
    "paymentMethod": "PIX"
  }'
```

## Create a credit card checkout

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: credit-card-payment-001" \
  -d '{
    "cpf": "52998224725",
    "description": "Credit card payment",
    "amount": 12.34,
    "paymentMethod": "CREDIT_CARD"
  }'
```

The response includes a `checkoutUrl` for Mercado Pago Checkout Pro.

## Key features

- CPF and request validation
- PIX and credit card payment methods
- Request idempotency through `Idempotency-Key`
- PostgreSQL persistence with Prisma migrations
- Mercado Pago checkout integration
- Webhook signature validation
- Unit tests for core use cases

## Tests and build

```bash
docker compose exec api npm test -- --runInBand
docker compose exec api npm run build
```