import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class BusinessAddress {
    @Prop()
    state: string

    @Prop()
    city: string;

    @Prop()
    detail: string
}

export const BusinessAddressSchema = SchemaFactory.createForClass(BusinessAddress);
