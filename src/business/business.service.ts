import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { FindBusinessByPhonenumberDto } from './DTO/find-business-by-phonenumber.dto';
import { Business } from './schema/business.schema';
import { CreateBusinessDto } from './DTO/create-business.dto';
import { AuthService } from 'src/auth/auth.service';
import { AccountTypeEnum } from './schema/account-type.enum';
import { SetBusinessAddressDto } from './DTO/set-business-address.dto';
import { SetBusinessWorkTimesDto } from './DTO/set-business-work-times.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  BusinessAddressModel,
  SetBusinessSetting,
} from './DTO/set-business-setting.dto';
import { FindBusinessByURLDto } from './DTO/find-business-by-name.dto';

@Injectable()
export class BusinessService {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectModel(Business.name) private businessModel: Model<Business>,
  ) {}

  async checkExistanceOfBusinessByPhoneNumber(
    findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto,
  ): Promise<{ IsBusinessExist: boolean; business: Business }> {
    const business = await this.businessModel.find({
      BusinessOwnerPhoneNumber: findBusinessByPhonenumberDto.phoneNumber,
    });
    if (business.length === 0) {
      return {
        IsBusinessExist: false,
        business: null,
      };
    }
    return {
      IsBusinessExist: true,
      business: business[0],
    };
  }

  async createBusiness(createBusinessDto: CreateBusinessDto) {
    const { phoneNumber } = this.authService.decodeToken(
      createBusinessDto.token,
    );
    try {
      const business = await this.businessModel.create({
        BusinessName: createBusinessDto.businessName,
        BusinessOwnerPhoneNumber: phoneNumber,
        BusinessType: createBusinessDto.businessType,
        OwnerFullName: createBusinessDto.ownerFullName,
        BusinessAddress: {
          state: null,
          city: null,
          detail: null,
        },
        AccountType: AccountTypeEnum.NOT_ACTIVE,
        BusinessRegisterDate: Date.now(),
        StartPlanDate: null,
        EndPlanDate: null,
        WorkTimes: {
          Monday: { morning: '', afternoon: '' },
          Tuesday: { morning: '', afternoon: '' },
          Wednesday: { morning: '', afternoon: '' },
          Thursday: { morning: '', afternoon: '' },
          Friday: { morning: '', afternoon: '' },
          Saturday: { morning: '', afternoon: '' },
          Sunday: { morning: '', afternoon: '' },
        },
        BusinessURL: createBusinessDto.businessURL,
        //this is something should think about it to find a good defualt picture url
        BusinessPictureURL: 'somthing',
      });
      const businessObj = { ...createBusinessDto };
      delete businessObj.token;
      const authToken = await this.authService.generateAccessToken(
        phoneNumber,
        business,
      );
      return {
        status: true,
        message: 'business create successfully',
        token: authToken,
      };
    } catch (error) {
      console.error(error.message);
      return new InternalServerErrorException();
    }
  }

  async getAdditionalInfo(token: string) {
    const { phoneNumber } = this.authService.decodeToken(token);
    try {
      const businessDoc = await this.businessModel.find({
        BusinessOwnerPhoneNumber: phoneNumber,
      });
      return {
        workSchedule: businessDoc[0].WorkTimes,
        address: businessDoc[0].BusinessAddress,
      };
    } catch (error) {
      this.logger.error(`function name: getAdditionalInfo in business service. error message: ${error.message}`)
      return new InternalServerErrorException()
    }
  }

  //TODO: needs to check state and city name to be correct value
  async setBusinessAddress(setBusinessAddressDto: SetBusinessAddressDto) {
    const { phoneNumber } = this.authService.decodeToken(
      setBusinessAddressDto.token,
    );
    try {
      const newBusinessDoc = await this.businessModel.updateOne(
        { BusinessOwnerPhoneNumber: phoneNumber },
        {
          BusinessAddress: {
            state: setBusinessAddressDto.state,
            city: setBusinessAddressDto.city,
            detail: setBusinessAddressDto.detail,
          },
        },
      );
      if (newBusinessDoc.modifiedCount === 1) {
        return {
          status: true,
          message: 'business set correctly',
          BusinessAddress: {
            state: setBusinessAddressDto.state,
            city: setBusinessAddressDto.city,
            detail: setBusinessAddressDto.detail,
          },
        };
      }
    } catch (error) {
      console.error(error.message);
      return {
        status: false,
        message: 'something went wrong during setting address',
      };
    }
  }

  async setWorkTimes(setBusinessWorkTimesDto: SetBusinessWorkTimesDto) {
    const { phoneNumber } = this.authService.decodeToken(
      setBusinessWorkTimesDto.token,
    );
    let workTimeObj = setBusinessWorkTimesDto;
    delete workTimeObj.token;
    try {
      const updatedBusinessDoc = await this.businessModel.updateOne(
        {
          BusinessOwnerPhoneNumber: phoneNumber,
        },
        {
          WorkTimes: {
            ...workTimeObj,
          },
        },
      );
      if (updatedBusinessDoc.modifiedCount === 1) {
        return {
          status: true,
          message: 'setting work times successfully!!!',
          phoneNumber,
          workTimeObj,
        };
      }
      return {
        status: false,
        message: 'something went wrong during setting up work times!!!',
        phoneNumber,
        workTimeObj,
      };
    } catch (error) {
      console.error(error.message);
      return {
        status: false,
        message: 'something went wrong during setting up work times!!!',
        phoneNumber,
        workTimeObj,
      };
    }
  }

  async getFullBusinessData(token: string) {
    const { phoneNumber } = this.authService.decodeToken(token);
    try {
      const businessDoc = await this.businessModel.find({
        BusinessOwnerPhoneNumber: phoneNumber,
      });
      return {
        status: true,
        message: 'getting information successsfully!!!',
        business: {
          phoneNumber,
          businessName: businessDoc[0].BusinessName,
          ownerName: businessDoc[0].OwnerFullName,
          BusinessURL: businessDoc[0].BusinessURL,
          address: businessDoc[0].BusinessAddress,
        },
      };
    } catch (error) {
      console.error(error.message);
      return new InternalServerErrorException();
    }
  }

  async setBusinessSetting(setBusinessSetting: SetBusinessSetting) {
    const { phoneNumber } = this.authService.decodeToken(
      setBusinessSetting.token,
    );
    try {
      const businessDoc = await this.businessModel.updateOne(
        {
          BusinessOwnerPhoneNumber: phoneNumber,
        },
        {
          BusinessName: setBusinessSetting.businessName,
          OwnerFullName: setBusinessSetting.ownerFullName,
          BusinessURL: setBusinessSetting.businessURL,
        },
      );
      return {
        status: true,
        message: 'business Information update successfully!!!',
      };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  async checkBusinessForActivation(token: string, inController: boolean) {
    const { phoneNumber, business } = this.authService.decodeToken(token);
    const businessDoc = await this.businessModel.findOne({
      BusinessOwnerPhoneNumber: phoneNumber,
    });
    const address: BusinessAddressModel =
      businessDoc.BusinessAddress as BusinessAddressModel;
    const isBusinessAddressValid = this.checkBusinessAddressValue(address);
    if (!isBusinessAddressValid) {
      return {
        status: false,
        message: 'address does not have valid value',
      };
    }
    const workTimes = businessDoc.WorkTimes;
    const isBusinessWorkTimesValid =
      this.checkBusinessWorkTimesValue(workTimes);
    if (!isBusinessWorkTimesValid) {
      return {
        status: false,
        message: 'work Times does not have valid value',
      };
    }
    if (inController) {
      return {
        status: true,
        message: 'business have all info for activation',
      };
    }
    return {
      status: true,
      accountType: businessDoc.AccountType,
      startPlan: businessDoc.StartPlanDate,
      endPlan: businessDoc.EndPlanDate,
      phoneNumber,
      business,
    };
  }

  async updateBusiness(
    phoneNumber: string,
    query: object,
    session: ClientSession,
  ) {
    await this.businessModel.updateOne(
      {
        BusinessOwnerPhoneNumber: phoneNumber,
      },
      { ...query },
      { session },
    );
  }

  checkBusinessAddressValue(BusinessAddress: BusinessAddressModel): boolean {
    if (
      BusinessAddress.state === '' ||
      BusinessAddress.city === '' ||
      BusinessAddress.detail === ''
    ) {
      return false;
    }
    if (
      BusinessAddress.state === null ||
      BusinessAddress.city === null ||
      BusinessAddress.detail === null
    ) {
      return false;
    }
    return true;
  }

  checkBusinessWorkTimesValue(workTimes) {
    const weekDayNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    for (let i = 0; i < 7; i++) {
      const dayName = weekDayNames[i];
      if (
        workTimes[dayName].morning === null ||
        workTimes[dayName].morning === undefined ||
        workTimes[dayName].morning === ''
      ) {
        return false;
      }
      if (
        workTimes[dayName].afternoon === null ||
        workTimes[dayName].afternoon === undefined ||
        workTimes[dayName].afternoon === ''
      ) {
        return false;
      }
    }
    return true;
  }

  async findBusinessByName(findBusinessByURLDto: FindBusinessByURLDto) {
    const businessobj = await this.businessModel.find({
      BusinessURL: findBusinessByURLDto.businessName,
    });
    return businessobj;
  }
}
