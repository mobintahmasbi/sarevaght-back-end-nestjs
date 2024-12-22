import { Body, Controller, Post } from "@nestjs/common";
import { FindBusinessByPhonenumberDto } from '../business/DTO/find-business-by-phonenumber.dto';
import { OTPService } from './otp.service';

@Controller('otp')
export class OTPController{
    constructor(private readonly otpService: OTPService) {}
    @Post('send')
    async sendOTP(@Body() findBusinessByPhonenumberDto: FindBusinessByPhonenumberDto) {
        const otpObj = await this.otpService.createOTP(findBusinessByPhonenumberDto)
        return otpObj
    }
}