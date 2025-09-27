import { Inject, Injectable } from '@nestjs/common';
import { Service } from './service.entity';
import { Repository } from 'typeorm';
import { GetServiceDTO } from './dto';

@Injectable()
export class ServiceService {

  constructor(
    @Inject('SERVICE_REPOSITORY') private serviceRepository: Repository<Service>
  ) {}

  // Retrieve all services and return them

  async getServices(): Promise<GetServiceDTO[]> {
    return await this.serviceRepository.find() || [];
  }

}
