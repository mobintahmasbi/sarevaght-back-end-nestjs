import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IranStateInfoService } from './iranStateInfo.service';
import { AuthGuard } from "src/business/guards/authentication.guard";
import { GetAllCitiesDto } from "./DTO/get-all-cities.dto";

@Controller('iran-state-info')
export class IranStateInfoController{
    constructor(private readonly iranStateInfoService: IranStateInfoService) {}

    @Post('all-state')
    @UseGuards(AuthGuard)
    async getAllState() {
        return this.iranStateInfoService.getAllStateName()
    }

    @Post('all-cities')
    @UseGuards(AuthGuard)
    async getAllCities(@Body() getAllCitiesDto: GetAllCitiesDto) {
        return this.iranStateInfoService.getAllCitiesName(getAllCitiesDto.stateName)
    }
}