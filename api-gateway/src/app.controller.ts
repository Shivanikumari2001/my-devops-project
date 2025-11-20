import { Controller, Get, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      message: 'API Gateway is running - CI/CD Test Successful!',
      version: '1.0.1',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway-service',
      timestamp: new Date().toISOString(),
    };
  }

  // User endpoints (Service1)
  @All('api/users*')
  async proxyUsers(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service1', req, res);
  }

  // Payment endpoints (Service2)
  @All('api/payments*')
  async proxyPayments(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service2', req, res);
  }

  // Fallback for other service routes
  @All('api/service1/*')
  async proxyService1(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service1', req, res);
  }

  @All('api/service2/*')
  async proxyService2(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service2', req, res);
  }

  // Direct service routes (without /api prefix)
  @All('service1')
  async proxyService1Root(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service1', req, res);
  }

  @All('service1/*')
  async proxyService1Direct(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service1', req, res);
  }

  @All('service2')
  async proxyService2Root(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service2', req, res);
  }

  @All('service2/*')
  async proxyService2Direct(@Req() req: Request, @Res() res: Response) {
    return this.appService.proxyRequest('service2', req, res);
  }
}

