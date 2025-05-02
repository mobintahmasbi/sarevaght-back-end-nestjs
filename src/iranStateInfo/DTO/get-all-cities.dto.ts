import { IsString } from "class-validator";


export class GetAllCitiesDto {
    @IsString()
    stateName: string

    @IsString()
    token: string
}