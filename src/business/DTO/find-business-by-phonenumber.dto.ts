import { IsString, Matches } from "class-validator";

export class FindBusinessByPhonenumberDto{
    @IsString()
    @Matches(/^09\d{9}$/)
    phoneNumber: string
}
