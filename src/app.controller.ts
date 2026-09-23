import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      name: 'Payment Lifecycle API',
      status: 'ok',
      documentation: '/api/docs',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
    };
  }
}