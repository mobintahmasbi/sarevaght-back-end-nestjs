import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Support } from "./schema/support.schema";
import { Model } from "mongoose";

@Injectable()
export class SupportService{
    constructor(@InjectModel(Support.name) private supportModel: Model<Support>){}

    
}