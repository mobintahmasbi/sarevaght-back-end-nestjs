import { Body, Controller, Post } from "@nestjs/common";
import { AppointmentService } from './appointment.service';
import { FindBusinessByURLDto } from "src/business/DTO/find-business-by-name.dto";
import { GetAppointmentDocDto } from "./DTO/get-appointment-doc.dto";

@Controller('appointment')
export class AppointmentController{
    constructor(private readonly appointmentService: AppointmentService) {}

    @Post('business-info')
    async getBusinessForCustomer(@Body() findBusinessByURLDto: FindBusinessByURLDto) {
        return this.appointmentService.giveBusinessInfoToCustomer(findBusinessByURLDto)
    }
    
    @Post('get-appointment-doc')
    async getAppointmentDoc(@Body() getAppointmentDocDto: GetAppointmentDocDto) {
        return this.appointmentService.getAppointmentDoc(getAppointmentDocDto)
    }
}