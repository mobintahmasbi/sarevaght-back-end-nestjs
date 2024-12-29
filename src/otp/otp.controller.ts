import { Body, Controller, Post } from "@nestjs/common";
import { FindBusinessByPhonenumberDto } from '../business/DTO/find-business-by-phonenumber.dto';
import { OTPService } from './otp.service';
import { ValidateOTPDto } from "./DTO/validateOTP.dto";
import { Throttle } from "@nestjs/throttler";

@Controller('otp')
export class OTPController{
    constructor(private readonly otpService: OTPService) {}

    
    @Post('send')
    @Throttle({ default: {limit: 10, ttl: 60000}})
    async sendOTP(@Body() findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto) {
        const otpObj = await this.otpService.createOTP(findBusinessByPhonenumberDto)
        return otpObj
    }

    @Post('validate')
    @Throttle({ default: {limit: 5, ttl: 60000}})
    async validateOTP(@Body() validateOTPDto: ValidateOTPDto) {
        const validationObj = await this.otpService.validateOTP(validateOTPDto)
        return validationObj
    }
}