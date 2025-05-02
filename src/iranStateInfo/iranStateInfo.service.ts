import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Model } from "mongoose";
import { IranStateInfo } from "./schema/iranStateInfo.schema";
import { InjectModel } from "@nestjs/mongoose";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class IranStateInfoService{
    constructor(
        @InjectModel(IranStateInfo.name) private IranStateInfoModel: Model<IranStateInfo>,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    async getAllStateName() {
        try {
            const allStateName = await this.IranStateInfoModel.find({}, {province: 1})
            return allStateName
        } catch (error) {
            this.logger.error(`function name: get all state name , error message: ${error.message}`)
            return new InternalServerErrorException()
        }        
    }

    async getAllCitiesName(stateName: string) {
        try {
            const allCitiesName = await this.IranStateInfoModel.findOne({province: stateName})
            return {
                stateName: allCitiesName.province,
                citiesName: allCitiesName.cities
            }
        } catch (error) {
            this.logger.error(`function name: get all cities name, error message: ${error.message}`)
            return new InternalServerErrorException()
        }
    }
}