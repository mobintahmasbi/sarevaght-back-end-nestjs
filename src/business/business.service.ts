import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FindBusinessByPhonenumberDto } from './DTO/find-business-by-phonenumber.dto';
import { Business } from './schema/business.schema';
import { CreateBusinessDto } from './DTO/create-business.dto';
import { AuthService } from 'src/auth/auth.service';
import { AccountTypeEnum } from './schema/account-type.enum';

@Injectable()
export class BusinessService {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(Business.name) private businessModel: Model<Business>,
  ) {}

  async checkExistanceOfBusinessByPhoneNumber(
    findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto,
  ): Promise<{ IsBusinessExist: boolean; business: Business }> {
    const business = await this.businessModel.find({
      BusinessOwnerPhoneNumber: findBusinessByPhonenumberDto.phoneNumber
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
        BusinessPictureURL: 'somthing'
      });
      const businessObj = { ...createBusinessDto}
      delete businessObj.token
      const authToken = await this.authService.generateAccessToken(phoneNumber, business)
      return {
        status: true,
        message: 'business create successfully',
        token: authToken
      }
    } catch (error) {
      console.error(error.message)
      return new InternalServerErrorException()
    }
  }
}
