import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import { Model } from 'mongoose';
import { BusinessService } from 'src/business/business.service';
import { FindBusinessByURLDto } from '../business/DTO/find-business-by-name.dto';
import { AccountTypeEnum } from '../business/schema/account-type.enum';
import { AppointmentStatusEnum } from './schema/appointment-status.enum';
import { GetAppointmentDocDto } from './DTO/get-appointment-doc.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
          businessInfo: {
            Name: business.BusinessName,
            phoneNumber: business.BusinessOwnerPhoneNumber,
            address: business.BusinessAddress,
            fullName: business.OwnerFullName,
          },
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
        businessInfo: {
          Name: business.BusinessName,
          phoneNumber: business.BusinessOwnerPhoneNumber,
          address: business.BusinessAddress,
          fullName: business.OwnerFullName,
        },
      };
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${findBusinessByURLDto.businessName}`,
      );
      return new InternalServerErrorException();
    }
  }

  async getAppointmentDoc(getAppointmentDocDto: GetAppointmentDocDto) {
    const { appointmentDate } = getAppointmentDocDto;
    const dateStartObject = new Date(appointmentDate);
    dateStartObject.setHours(0, 0, 0, 0);
    const dateEndObject = new Date(appointmentDate);
    dateEndObject.setHours(23, 59, 59, 999);
    try {
      const appointmentDoc = await this.AppointmentModel.find({
        businessURL: getAppointmentDocDto.appointmentDate,
        createdAt: {
          $gte: dateStartObject,
          $lte: dateEndObject,
        },
      });
      if (appointmentDoc.length === 1) {
        return {
          status: true,
          message: 'getting appointment document successfully',
          appointmentDocument: {
            bname: appointmentDoc[0].businessName,
            burl: appointmentDoc[0].businessURL,
            appointmentObject: appointmentDoc[0].appointmentsObj,
            appointmentDate: appointmentDoc[0].createdAt,
            dayName: appointmentDoc[0].dayname
          },
        };
      }
      const businessDocs =
        await this.businessService.findBusinessByName(getAppointmentDocDto);
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
      let timePeriod = {}
      if(bworkTimeToday.morning !== 'closed') {
        const startEnd = bworkTimeToday.morning.split('-')
        let tpm = this.generateTimeSlots(startEnd[0], startEnd[1])
        timePeriod = {
          ...tpm
        }
      }
      if(bworkTimeToday.afternoon !== 'closed') {
        const startEnd = bworkTimeToday.afternoon.split('-')
        let tpa = this.generateTimeSlots(startEnd[0], startEnd[1])
        timePeriod = {
          ...tpa
        }
      }
      const newAppointmentObj = await this.AppointmentModel.create({
        dayname: dayName,
        businessName: business.BusinessName,
        businessPhoneNumber: business.BusinessOwnerPhoneNumber,
        createdAt: Date.now(),
        status: AppointmentStatusEnum.OPEN,
        businessURL: getAppointmentDocDto.businessName,
        appointmentsObj: {
          ...timePeriod
        }
      })
      return {
        status: true,
        message: 'getting appointment document successfully',
        appointmentDocument: {
          bname: newAppointmentObj.businessName,
          burl: newAppointmentObj.businessURL,
          appointmentObject: newAppointmentObj.appointmentsObj,
          appointmentDate: newAppointmentObj.createdAt,
          dayName: newAppointmentObj.dayname
        },
      }
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${getAppointmentDocDto.businessName}`,
      );
      return new InternalServerErrorException();
    }
  }

  private parseTime(timeStr: string) {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    return hours * 60 + minutes;
  }

  private formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }
  
  generateTimeSlots(start: string, end: string) {
    const startMinutes = this.parseTime(start);
    const endMinutes = this.parseTime(end);
    const timeSlots = {};
  
    // Iterate from startMinutes up to but not including endMinutes in 30-minute steps
    for (let t = startMinutes; t < endMinutes; t += 30) {
      const timeKey = this.formatTime(t);
      timeSlots[timeKey] = {};
    }
    
    return timeSlots;
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
