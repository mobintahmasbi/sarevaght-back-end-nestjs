import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RegisterationGuard } from "./guards/registeration.guard";
import { CreateBusinessDto } from "./DTO/create-business.dto";
import { BusinessService } from "./business.service";
import { AuthGuard } from "./guards/authentication.guard";
import { SetBusinessAddressDto } from "./DTO/set-business-address.dto";
import { SetBusinessWorkTimesDto } from "./DTO/set-business-work-times.dto";
import { SetBusinessSetting } from "./DTO/set-business-setting.dto";

@Controller('business')
export class BusinessController{
    constructor(private readonly businessService: BusinessService){}

    @Post('create')
    @UseGuards(RegisterationGuard)
    async createbusiness(@Body() createBusinessDto: CreateBusinessDto) {
        return this.businessService.createBusiness(createBusinessDto)
    }

    @Post('additional-data')
    @UseGuards(AuthGuard)
    async getAddtionalData(@Body() authToken: { token: string }) {
        return this.businessService.getAdditionalInfo(authToken.token)
    }

    @Post('set-address')
    @UseGuards(AuthGuard)
    async setAddress(@Body() setBusinessAddressDto: SetBusinessAddressDto) {
        return this.businessService.setBusinessAddress(setBusinessAddressDto)
    }

    @Post('set-Times')
    @UseGuards(AuthGuard)
    async setTimes(@Body() setBusinessWorkTimesDto: SetBusinessWorkTimesDto) {
        return this.businessService.setWorkTimes(setBusinessWorkTimesDto)
    }

    @Post('get-info')
    @UseGuards(AuthGuard)
    async getBusinessInfo(@Body() Token: { token: string }) {
        return this.businessService.getFullBusinessData(Token.token)
    }

    @Post('setting')
    @UseGuards(AuthGuard)
    async setSetting(@Body() setBusinessSetting: SetBusinessSetting) {
        return this.businessService.setBusinessSetting(setBusinessSetting)
    }

    @Post('check-activation')
    @UseGuards(AuthGuard)
    async checkBusinessInfoForActivation(@Body() Token: {token: string}) {
        return this.businessService.checkBusinessForActivation(Token.token)
    }
}
