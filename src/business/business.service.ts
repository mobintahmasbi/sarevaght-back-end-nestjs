import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FindBusinessByPhonenumberDto } from './DTO/find-business-by-phonenumber.dto';
import { Business } from './schema/business.schema';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<Business>,
  ) {}

  async checkExistanceOfBusinessByPhoneNumber(
    findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto,
  ): Promise<{ IsBusinessExist: boolean; business: Business }> 
  {
    const business = await this.businessModel.find(
      findBusinessByPhonenumberDto,
    );
    if (business.length === 0) {
      return {
        IsBusinessExist: false,
        business: null
      };
    }
    return {
      IsBusinessExist: true,
      business: business[0],
    };
  }
}
