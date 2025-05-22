import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../business/guards/authentication.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController{
    constructor( private readonly paymentService: PaymentService ) {}

    @Post('free-trial')
    @UseGuards(AuthGuard)
    async startFreeTrial(@Body() Token: { token: string }) {
        return this.paymentService.activateFreeTrial(Token.token)
    }

    @Post('check-free-trial')
    @UseGuards(AuthGuard)
    async checkingUsageFreeTrial(@Body() Token: { token: string }) {
        return this.paymentService.checkFreeTrialUsage(Token.token)
    }

}