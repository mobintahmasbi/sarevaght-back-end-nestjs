import { IsDate, IsString } from "class-validator";
import { FindBusinessByURLDto } from "src/business/DTO/find-business-by-name.dto";

export class GetAppointmentDocDto extends FindBusinessByURLDto {
    @IsDate()
    appointmentDate: Date
}