import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OTP, OTPSchema } from "./schema/otp.schema";
import { OTPService } from "./otp.service";
import { BusinessModule } from "src/business/business.module";
import { OTPController } from "./otp.controller";

@Module({
    imports: [MongooseModule.forFeature([{name: OTP.name, schema: OTPSchema}]), BusinessModule],
    controllers: [OTPController],
    providers: [OTPService]
})
export class OTPModule{}