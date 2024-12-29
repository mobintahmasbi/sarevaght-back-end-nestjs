import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { RegisterationGuard } from "./guards/registeration.guard";

@Controller('business')
export class BusinessController{
    constructor(private readonly authService: AuthService){}

    @Post('create')
    @UseGuards(RegisterationGuard)
    async createbusiness(@Body() Token: { token: string}) {
        return 'hello'
    }
}
