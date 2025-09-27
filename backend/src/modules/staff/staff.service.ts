import { Inject, Injectable } from '@nestjs/common';
import { Staff } from './staff.entity';
import { Repository } from 'typeorm';
import { GetStaffDTO } from './dto';

@Injectable()
export class StaffService {

  constructor(
    @Inject('STAFF_REPOSITORY') private staffRepository: Repository<Staff>
  ) {}

  // Retrieve all services and return them

  async getStaff(): Promise<GetStaffDTO[]> {

    const staffList: Staff[] = await this.staffRepository.find() || [];

    const staffDTO: GetStaffDTO[] = staffList.map(item => ({
        id: item.id,
        name: item.name
    }));
    return staffDTO;

  }

}
