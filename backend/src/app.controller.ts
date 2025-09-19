import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {

    // What is returned as a resposne
    // Determines content type automatically
    // Can use @Header('Content-Type', 'text/html') to force a type if it is returning it incorrectly
    return this.appService.getHello(); 
  }
}
