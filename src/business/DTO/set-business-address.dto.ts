import { IsString } from "class-validator";

export class SetBusinessAddressDto{
    @IsString()
    State: string

    @IsString()
    city: string

    @IsString()
    detail: string

    @IsString()
    token: string
}