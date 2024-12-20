import { Module } from "@nestjs/common";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Business, BusinessSchema } from "./schema/business.schema";

@Module({
    imports: [MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }])],
    controllers: [BusinessController],
    providers: [BusinessService]
})
export class BusinessModule{}