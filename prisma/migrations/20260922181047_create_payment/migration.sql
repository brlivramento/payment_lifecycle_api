-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAIL');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "description" TEXT NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_cpf_idx" ON "payments"("cpf");

-- CreateIndex
CREATE INDEX "payments_payment_method_idx" ON "payments"("payment_method");
