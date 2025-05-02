import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IranStateInfo, IranStateInfoSchema } from "./schema/iranStateInfo.schema";
import { IranStateInfoController } from './iranStateInfo.controller';
import { IranStateInfoService } from "./iranStateInfo.service";
import { BusinessModule } from "src/business/business.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: IranStateInfo.name, schema: IranStateInfoSchema }]),AuthModule, BusinessModule],
    controllers: [IranStateInfoController],
    providers: [IranStateInfoService]
})
export class IranStateInfoModule {}