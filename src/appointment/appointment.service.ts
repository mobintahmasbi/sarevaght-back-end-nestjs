import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import { Model } from 'mongoose';
import { BusinessService } from 'src/business/business.service';
import { FindBusinessByURLDto } from '../business/DTO/find-business-by-name.dto';
import { AccountTypeEnum } from '../business/schema/account-type.enum';
import { AppointmentStatusEnum } from './schema/appointment-status.enum';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly AppointmentModel: Model<Appointment>,
    private readonly businessService: BusinessService,
  ) {}

  async giveBusinessInfoToCustomer(findBusinessByURLDto: FindBusinessByURLDto) {
    try {
      const businessDocs =
        await this.businessService.findBusinessByName(findBusinessByURLDto);
      if (businessDocs.length === 0) {
        return {
          status: false,
          bstatus: null,
          message: 'no business found with this URL.',
        };
      }
      const business = businessDocs[0];
      const epbusines = new Date(business.EndPlanDate);
      const currentDate = new Date();
      if (
        business.AccountType === AccountTypeEnum.NOT_ACTIVE ||
        business.AccountType === AccountTypeEnum.END_PLAN ||
        business.EndPlanDate === null ||
        epbusines < currentDate
      ) {
        return {
          status: true,
          bstatus: 'not active',
          message: 'business does not have active plan ',
        };
      }
      const dayName = this.getDayName(currentDate);
      const bworkTimeToday = business.WorkTimes[dayName];
      if (
        bworkTimeToday.morning === 'closed' &&
        bworkTimeToday.afternoon === 'closed'
      ) {
        return {
          status: true,
          bstatus: 'closed',
          message: 'buseinss is closed today',
        };
      }
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const appointmentDocs = await this.AppointmentModel.find({
        businessPhoneNumber: business.BusinessOwnerPhoneNumber,
        createdAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });
      if (appointmentDocs.length === 0) {
        return {
          status: true,
          bstatus: 'open',
          message: 'business is open today and ready to reserve appointments',
        };
      }
      const appointment = appointmentDocs[0];
      if (appointment.status === AppointmentStatusEnum.CLOSED) {
        return {
          status: true,
          bstatus: 'closed',
          message: 'business is closed today',
        };
      }
      return {
        status: true,
        bstatus: 'open',
        message: 'business is open today and ready to reserve appointments',
      };
    } catch (error) {
      console.error(error.message);
      return new InternalServerErrorException();
    }
  }

  getDayName(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayIndex = date.getDay();
    return days[dayIndex];
  }
}
