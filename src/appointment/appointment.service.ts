import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Appointment } from './schema/appointment.schema';
import mongoose, { Model } from 'mongoose';
import { BusinessService } from 'src/business/business.service';
import { FindBusinessByURLDto } from '../business/DTO/find-business-by-name.dto';
import { AccountTypeEnum } from '../business/schema/account-type.enum';
import { AppointmentStatusEnum } from './schema/appointment-status.enum';
import { GetAppointmentDocDto } from './DTO/get-appointment-doc.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CacheService } from '../cache/cache.service';
import { SetAppointmentDto } from './DTO/set-appointment.dto';
import { Customer } from './schema/customer.schema';

@Injectable()
export class AppointmentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectModel(Customer.name) private readonly CustomerModel: Model<Customer>,
    @InjectModel(Appointment.name)
    private readonly AppointmentModel: Model<Appointment>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly businessService: BusinessService,
    private readonly cacheService: CacheService,
  ) {}

  async getBusiness(findBusinessByURLDto: FindBusinessByURLDto) {
    const todayDate = new Date().setHours(0, 0, 0, 0);

    try {
      const cacheResult =
        (await this.cacheService.get(findBusinessByURLDto.businessName)) || {};

      let { businessInfo, cachingDate } = cacheResult;

      if (!businessInfo || cachingDate != todayDate) {
        let businessDocs =
          await this.businessService.findBusinessByName(findBusinessByURLDto);
        if (businessDocs.length === 0) {
          return {
            status: 404,
          };
        }

        businessInfo = {
          ...businessDocs[0],
        };
        await this.cacheService.set(
          businessDocs[0].BusinessURL,
          {
            businessInfo,
            cachingDate: todayDate,
          },
          0,
        );
      }
      return {
        status: 200,
        businessInfo: businessInfo._doc,
      };
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${findBusinessByURLDto.businessName}`,
      );
      return {
        status: 500,
      };
    }
  }

  async validateBusiness(findBusinessByURLDto: FindBusinessByURLDto) {
    const { status, businessInfo } =
      await this.getBusiness(findBusinessByURLDto);
    if (status === 404 || status === 500) {
      return {
        status,
        message: status === 404 ? 'no business found with this URL.' : null,
      };
    }

    const business = businessInfo;
    const businessInformation = {
      Name: business.BusinessName,
      phoneNumber: business.BusinessOwnerPhoneNumber,
      address: business.BusinessAddress,
      fullName: business.OwnerFullName,
    };

    const epbusines = new Date(business.EndPlanDate);
    const currentDate = new Date();
    if (
      business.AccountType === AccountTypeEnum.NOT_ACTIVE ||
      business.AccountType === AccountTypeEnum.END_PLAN ||
      business.EndPlanDate === null ||
      epbusines < currentDate
    ) {
      return {
        status: 403,
        message: 'business does not have active plan',
        bstatus: 'not active',
        businessInformation,
      };
    }

    const dayName = this.getDayName(currentDate);
    const bworkTimeToday = business.WorkTimes[dayName];
    if (
      bworkTimeToday.morning === 'closed' &&
      bworkTimeToday.afternoon === 'closed'
    ) {
      return {
        status: 403,
        message: 'buseinss is closed today',
        bstatus: 'closed',
        businessInformation,
      };
    }
    return {
      status: 200,
      bstatus: 'open',
      businessInformation,
      business,
    };
  }

  async giveBusinessInfoToCustomer(findBusinessByURLDto: FindBusinessByURLDto) {
    try {
      const { business, status, message, businessInformation, bstatus } =
        await this.validateBusiness(findBusinessByURLDto);
      if (status === 404) {
        return {
          status: 404,
          message,
        };
      }
      if (status === 500) {
        return new InternalServerErrorException();
      }
      if (status === 403) {
        return {
          status: 403,
          message,
          bstatus,
          businessInformation,
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
          businessInformation,
        };
      }
      const appointment = appointmentDocs[0];
      if (appointment.status === AppointmentStatusEnum.CLOSED) {
        return {
          status: true,
          bstatus: 'closed',
          message: 'business is closed today',
          businessInformation,
        };
      }
      return {
        status: true,
        bstatus: 'open',
        message: 'business is open today and ready to reserve appointments',
        businessInformation,
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
      const { business, status, message, businessInformation, bstatus } =
        await this.validateBusiness(getAppointmentDocDto);
      if (status === 404) {
        return {
          status: 404,
          message,
        };
      }
      if (status === 500) {
        return new InternalServerErrorException();
      }
      if (status === 403) {
        return {
          status: 403,
          message,
          bstatus,
          businessInformation,
        };
      }
      const appointmentDocs = await this.AppointmentModel.find({
        businessPhoneNumber: business.BusinessOwnerPhoneNumber,
        createdAt: {
          $gte: dateStartObject,
          $lte: dateEndObject,
        },
      });
      if (appointmentDocs.length === 1) {
        console.log(appointmentDocs[0]);

        return {
          status: true,
          message: 'getting appointment document successfully',
          appointmentDocument: {
            bname: appointmentDocs[0].businessName,
            appointmentObject: appointmentDocs[0].appointmentsObj,
            appointmentDate: appointmentDocs[0].createdAt,
            dayName: appointmentDocs[0].dayname,
            status: appointmentDocs[0].status,
          },
        };
      }
      const dayName = this.getDayName(appointmentDate);
      const bworkTimeToday = business.WorkTimes[dayName];
      let timePeriod = {};
      if (bworkTimeToday.morning !== 'closed') {
        const startEnd = bworkTimeToday.morning.split('-');
        let tpa = this.generateTimeSlots(startEnd[0], startEnd[1]);
        timePeriod = {
          ...tpa,
        };
      }
      if (bworkTimeToday.afternoon !== 'closed') {
        const startEnd = bworkTimeToday.afternoon.split('-');
        let tpa = this.generateTimeSlots(startEnd[0], startEnd[1]);
        timePeriod = {
          ...timePeriod,
          ...tpa,
        };
      }
      const newAppointmentObj = await this.AppointmentModel.create({
        dayname: dayName,
        businessName: business.BusinessName,
        businessPhoneNumber: business.BusinessOwnerPhoneNumber,
        businessURL: business.BusinessURL,
        createdAt: appointmentDate,
        status: AppointmentStatusEnum.OPEN,
        appointmentsObj: {
          ...timePeriod,
        },
      });
      return {
        status: true,
        message: 'getting appointment document successfully',
        appointmentDocument: {
          bname: newAppointmentObj.businessName,
          appointmentObject: newAppointmentObj.appointmentsObj,
          appointmentDate: newAppointmentObj.createdAt,
          dayName: newAppointmentObj.dayname,
        },
      };
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${getAppointmentDocDto.businessName}`,
      );
      return new InternalServerErrorException();
    }
  }

  async setAppointment(setAppointmentDto: SetAppointmentDto) {
    const {
      appointmentHour,
      appointmentDate,
      businessName,
      detail,
      customerName,
      customerPhoneNumber,
    } = setAppointmentDto;
    let startAppointmentDate = new Date(appointmentDate).setHours(0, 0, 0, 0);
    const endAppointmentDate = new Date(appointmentDate).setHours(
      23,
      59,
      59,
      999,
    );
    let todayStartDate = new Date().setHours(0, 0, 0, 0);
    if (todayStartDate > startAppointmentDate) {
      return {
        status: false,
        message: "you can't get appointment in the past",
      };
    }
    try {
      const appointmentDocs = await this.AppointmentModel.find({
        businessURL: businessName,
        createdAt: {
          $gte: startAppointmentDate,
          $lte: endAppointmentDate,
        },
      });
      if (appointmentDocs.length === 0) {
        return {
          status: false,
          message:
            'no appointment doc found for this date and this business url , come back and start from personal page',
        };
      }
      const appointment = appointmentDocs[0];
      const { appointmentsObj } = appointment;
      const app = appointmentsObj.get(appointmentHour);
      if (app !== null) {
        return {
          status: false,
          message: 'this date taken by another person before',
        };
      }
      if (!appointmentsObj.has(appointmentHour)) {
        return {
          status: false,
          message:
            'this business does not accept appointment for this specific time',
        };
      }
      if (startAppointmentDate > todayStartDate) {
        const { status } = await this.setAppointmentIntoMongo(
          setAppointmentDto,
          appointment,
        );
        if (status) {
          return {
            status,
            message: 'setting appointment successfully',
            appointmentInfo: {
              customerName,
              customerPhoneNumber,
              appointmentDate,
              appointmentHour,
            },
          };
        }
        return new InternalServerErrorException()
      }
      const currentDate = new Date()
      const currentDateString = `${currentDate.getHours()}:${currentDate.getMinutes()}`
      const requestedMinutes = this.timeToMinutes(appointmentHour) + 40
      const currentMinutes = this.timeToMinutes(currentDateString)
      if(currentMinutes >= requestedMinutes) {
        const { status } = await this.setAppointmentIntoMongo(
          setAppointmentDto,
          appointment,
        );
        if (status) {
          return {
            status,
            message: 'setting appointment successfully',
            appointmentInfo: {
              customerName,
              customerPhoneNumber,
              appointmentDate,
              appointmentHour,
            },
          };
        }
        return new InternalServerErrorException()
      }
      return {
        status: false,
        message: 'for setting an appointment must act atleast 40 minutes before the appointment time'
      }
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${setAppointmentDto.businessName}, error object : ${error}`,
      );
      return new InternalServerErrorException();
    }
  }

  private timeToMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private async setAppointmentIntoMongo(
    setAppointmentDto: SetAppointmentDto,
    appointment,
  ) {
    const {
      appointmentHour,
      appointmentDate,
      businessName,
      detail,
      customerName,
      customerPhoneNumber,
    } = setAppointmentDto;

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      await this.AppointmentModel.updateOne(
        {
          _id: appointment._id,
        },
        {
          $set: {
            [`appointmentsObj.${appointmentHour}`]: {
              customerName,
              customerPhoneNumber,
              detail,
            },
          },
        },
        { session },
      );

      await this.CustomerModel.create(
        {
          customerPhoneNumber,
          customerName,
          businessPhoneNumber: appointment.businessPhoneNumber,
          appointmentDate,
          appointmentHour,
          detail,
        },
        { session },
      );

      await session.commitTransaction();
      return {
        status: true,
      };
    } catch (error) {
      this.logger.error(
        `error message: ${error.message}, business url that user want to accesss: ${setAppointmentDto.businessName}, error object : ${error}`,
      );
      return {
        status: false,
      };
    } finally {
      session.endSession();
    }
  }

  private parseTime(timeStr: string) {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    return hours * 60 + minutes;
  }

  private formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  generateTimeSlots(start: string, end: string) {
    const startMinutes = this.parseTime(start);
    const endMinutes = this.parseTime(end);
    const timeSlots = {};

    // Iterate from startMinutes up to but not including endMinutes in 30-minute steps
    for (let t = startMinutes; t < endMinutes; t += 30) {
      const timeKey = this.formatTime(t);
      timeSlots[timeKey] = null;
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
