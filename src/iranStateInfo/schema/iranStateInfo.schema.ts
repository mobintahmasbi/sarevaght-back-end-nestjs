import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IranStateInfoDocument = HydratedDocument<IranStateInfo>;

@Schema()
export class IranStateInfo{
    @Prop()
    province: string

    @Prop()
    cities: string[]
}

export const IranStateInfoSchema = SchemaFactory.createForClass(IranStateInfo);