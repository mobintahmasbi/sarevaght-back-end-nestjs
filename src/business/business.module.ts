import { Module } from "@nestjs/common";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Business, BusinessSchema } from "./schema/business.schema";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]), AuthModule],
    controllers: [BusinessController],
    providers: [BusinessService],
    exports: [BusinessService]
})
export class BusinessModule{}