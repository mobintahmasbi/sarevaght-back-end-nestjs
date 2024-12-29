import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OTP, OTPSchema } from "./schema/otp.schema";
import { OTPService } from "./otp.service";
import { BusinessModule } from "src/business/business.module";
import { OTPController } from "./otp.controller";
import { AuthModule } from "src/auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
    imports: [MongooseModule.forFeature([{name: OTP.name, schema: OTPSchema}]), BusinessModule, AuthModule],
    controllers: [OTPController],
    providers: [OTPService, {
        provide: APP_GUARD,
        useClass: ThrottlerGuard
    }]
})
export class OTPModule{}