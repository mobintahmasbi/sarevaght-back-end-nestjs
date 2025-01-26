import { IsString } from 'class-validator';

export class FindBusinessByURLDto {
  @IsString()
  businessName: string;
}
