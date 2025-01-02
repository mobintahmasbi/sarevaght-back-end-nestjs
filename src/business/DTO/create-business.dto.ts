import { IsString, } from "class-validator";

export class CreateBusinessDto {
    @IsString()
    businessName: string

    @IsString()
    ownerFullName: string

    @IsString()
    businessType: string

    @IsString()
    businessURL: string

    @IsString()
    token: string
}