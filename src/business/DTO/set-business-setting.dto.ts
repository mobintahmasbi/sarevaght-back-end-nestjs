import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

export class BusinessAddressModel{
    @IsString()
    state: string;

    @IsString()
    city: string;

    @IsString()
    detail: string;
}

export class SetBusinessSetting {
  @IsString()
  businessName: string;

  @IsString()
  ownerFullName: string;

  @IsString()
  businessURL: string;

  @IsString()
  token: string;
}
