import { Type } from "class-transformer";
import { IsString, ValidateNested } from "class-validator";

class BusinessAddress{
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
  businessType: string;

  @IsString()
  businessURL: string;

  @ValidateNested()
  @Type(() => BusinessAddress)
  businessAddress: BusinessAddress

  @IsString()
  token: string;
}
