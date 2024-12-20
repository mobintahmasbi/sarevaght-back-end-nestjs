import { IsString, Matches } from "class-validator";

export class FindBusinessByPhonenumber{
    @IsString()
    @Matches(/^09\d{9}$/)
    phoneNumber: string
}
