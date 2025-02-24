import { IsString, Matches } from "class-validator";
import { GetAppointmentDocDto } from "./get-appointment-doc.dto";


export class SetAppointmentDto extends GetAppointmentDocDto {
    @IsString()
    @Matches(/^\d{1,2}:\d{1,2}$/)
    appointmentHour: string

    @IsString()
    customerName: string

    @IsString()
    @Matches(/^09\d{9}$/)
    customerPhoneNumber: string

    @IsString()
    detail: string
}