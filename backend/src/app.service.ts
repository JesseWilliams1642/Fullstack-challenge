import { Inject, Injectable } from '@nestjs/common';
import { Service } from './modules/service/service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {

  constructor(
    @Inject('SERVICE_REPOSITORY') private serviceRepository: Repository<Service>
  ) {}

  // Retrieve all services and return them

  async getService(): Promise<Service[]> {
    return await this.serviceRepository.find() || [];
  }

}
