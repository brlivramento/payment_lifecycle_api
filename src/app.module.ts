import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infra/database/prisma/prisma.module';
import { PaymentModule } from './infra/http/payment/payment.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}