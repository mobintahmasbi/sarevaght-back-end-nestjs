import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RegisterationGuard } from "./guards/registeration.guard";
import { CreateBusinessDto } from "./DTO/create-business.dto";
import { BusinessService } from "./business.service";

@Controller('business')
export class BusinessController{
    constructor(private readonly businessService: BusinessService){}

    @Post('create')
    @UseGuards(RegisterationGuard)
    async createbusiness(@Body() createBusinessDto: CreateBusinessDto) {
        return this.businessService.createBusiness(createBusinessDto)
    }
}
