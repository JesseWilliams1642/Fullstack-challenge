import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Service } from './modules/service/service.entity';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Get all services to display on front page

  @Get()
  async getServices(): Promise<Service[]> {
    return await this.appService.getService(); 
  }

}
