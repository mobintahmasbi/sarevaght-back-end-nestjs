import { IsDate } from "class-validator";
import { Type } from 'class-transformer';
import { FindBusinessByURLDto } from "src/business/DTO/find-business-by-name.dto";

export class GetAppointmentDocDto extends FindBusinessByURLDto {
    @Type(() => Date)
    @IsDate()
    appointmentDate: Date
}