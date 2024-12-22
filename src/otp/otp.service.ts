import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessService } from 'src/business/business.service';
import { OTP } from './schema/otp.schema';
import { Model } from 'mongoose';
import { FindBusinessByPhonenumberDto } from '../business/DTO/find-business-by-phonenumber.dto';

@Injectable()
export class OTPService {
  constructor(
    private readonly businessService: BusinessService,
    @InjectModel(OTP.name) private OTPModel: Model<OTP>,
  ) {}

  async createOTP(findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto) {
    const phoneNumber = findBusinessByPhonenumberDto.phoneNumber
    const otpDoc = await this.OTPModel.find({ phoneNumber })
    if(otpDoc.length === 0) {
        let otpCode = this.generateOTPCode()
        const createdOTP = await this.OTPModel.create({
            phoneNumber,
            OtpCode: otpCode
        })
        return {
            status: true,
            message: 'otp code generated successfully',
            phoneNumber,
        }
    }
    if(otpDoc.length === 1) {
        return {
            status: false,
            message: 'otp code already exist and valid',
            phoneNumber
        }
    }
    return {
        status: false,
        message: 'something unusual happened',
        phoneNumber
    }
  }

  private generateOTPCode(): string {
    let otpCode: string = ''
    for(let i = 0; i < 5; i++) {
        let randomNumber = Math.floor((Math.random() * 9) + 1)
        otpCode = otpCode + randomNumber
    }
    console.log(otpCode);
    return otpCode
  }
}
