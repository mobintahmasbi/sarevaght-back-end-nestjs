import { IsString, Matches } from "class-validator";

export class ValidateOTPDto{
    
    @IsString()
    @Matches(/^09\d{9}$/)
    phoneNumber: string

    @IsString()
    @Matches(/^\d{5}$/)
    otpCode: string

}