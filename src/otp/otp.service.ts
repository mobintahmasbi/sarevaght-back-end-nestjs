import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessService } from 'src/business/business.service';
import { OTP } from './schema/otp.schema';
import { Model } from 'mongoose';
import { FindBusinessByPhonenumberDto } from '../business/DTO/find-business-by-phonenumber.dto';
import { ValidateOTPDto } from './DTO/validateOTP.dto';
import { AuthService } from 'src/auth/auth.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { InteractionService } from '../interaction/interaction.service';
import { DateTime } from 'luxon';

@Injectable()
export class OTPService {
  constructor(
    private readonly businessService: BusinessService,
    private readonly authService: AuthService,
    private readonly interactionService: InteractionService,
    @InjectModel(OTP.name) private OTPModel: Model<OTP>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createOTP(findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto) {
    const phoneNumber = findBusinessByPhonenumberDto.phoneNumber;
    try {
      this.logger.info(
        `user try to enter with this phoneNumber: ${phoneNumber}`,
      );
      const otpDoc = await this.OTPModel.find({ phoneNumber });
      if (otpDoc.length === 0) {
        let otpCode = this.generateOTPCode();
        const smsStat = await this.interactionService.sendCode(phoneNumber, otpCode)
        if(!smsStat) {
          return {
            status: 500,
            message: 'somthing went wrong please try again',
            phoneNumber
          }
        }
        const createdOTP = await this.OTPModel.create({
          phoneNumber,
          OtpCode: otpCode,
        });
        return {
          status: 201,
          message: 'otp code generated successfully',
          phoneNumber,
        };
      }
      const currentDate = DateTime.fromJSDate(new Date()).setZone('utc')
      const expiresDate = DateTime.fromJSDate(otpDoc[0].ExpiredAt).setZone('utc')
      if(otpDoc.length === 1 && expiresDate < currentDate) {
        await this.OTPModel.deleteOne({ phoneNumber })
        let otpCode = this.generateOTPCode();
        const smsStat = await this.interactionService.sendCode(phoneNumber, otpCode)
        if(!smsStat) {
          return {
            status: 500,
            message: 'somthing went wrong please try again',
            phoneNumber
          }
        }
        const createdOTP = await this.OTPModel.create({
          phoneNumber,
          OtpCode: otpCode,
        });
        return {
          status: 201,
          message: 'otp code generated successfully',
          phoneNumber,
        };
      }
      if (otpDoc.length === 1 && expiresDate > currentDate) {
        return {
          status: 400,
          message: 'otp code already exist and valid',
          phoneNumber,
        };
      }
      return {
        status: 500,
        message: 'something unusual happened',
        phoneNumber,
      };
    } catch (error) {
      this.logger.error(`user phoneNumber: ${phoneNumber}, error message: ${error.message}`, error);
      return new InternalServerErrorException();
    }
  }

  //needs a refactor
  async validateOTP(validateOTPDto: ValidateOTPDto) {
    const { phoneNumber, otpCode } = validateOTPDto;

    try {
      this.logger.info(`user with this phoneNumber: ${phoneNumber}, try to enter with this otp code: ${otpCode}`)
      const otpDoc = await this.OTPModel.find({ phoneNumber });

      if (otpDoc.length === 0) {
        return {
          status: 400,
          message: 'otp is wrong',
          phoneNumber,
        };
      }
      const currentDate = DateTime.fromJSDate(new Date()).setZone('utc')
      const expiresDate = DateTime.fromJSDate(otpDoc[0].ExpiredAt).setZone('utc')
      if(otpDoc.length === 1 && expiresDate < currentDate) {
        await this.OTPModel.deleteOne({ phoneNumber })
        return {
          status: 400,
          message: 'otp is expired',
          phoneNumber,
        };
      }
      if (otpDoc.length === 1 && expiresDate > currentDate) {
        const isCorrectOTP = otpDoc[0].OtpCode === otpCode;
        if (!isCorrectOTP) {
          return {
            status: 400,
            message: 'otp is wrong',
            phoneNumber,
          };
        }
        if (isCorrectOTP) {
          const BusinessDoc =
            await this.businessService.checkExistanceOfBusinessByPhoneNumber({
              phoneNumber,
            });
          if (BusinessDoc.IsBusinessExist) {
            const token = await this.authService.generateAccessToken(
              phoneNumber,
              BusinessDoc.business,
            );
            return {
              status: 200,
              message: 'otp is correct',
              phoneNumber,
              registered: true,
              token,
            };
          }
          const registerToken =
            await this.authService.generateRegisterToken(phoneNumber);
          return {
            status: 200,
            message: 'otp is correct',
            phoneNumber,
            registered: false,
            registerToken: registerToken,
          };
        }
      }
    } catch (error) {
      this.logger.error(`user phoneNumber: ${phoneNumber},error message: ${error.message}`, error)
      return new InternalServerErrorException()
    }
  }

  private generateOTPCode(): string {
    let otpCode: string = '';
    for (let i = 0; i < 5; i++) {
      let randomNumber = Math.floor(Math.random() * 9 + 1);
      otpCode = otpCode + randomNumber;
    }
    return otpCode;
  }
}
