import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CustomerDocument = HydratedDocument<Customer>

@Schema()
export class Customer{
    @Prop()
    customerPhoneNumber: string

    @Prop()
    businessPhoneNumber: string

    @Prop({
        type: Date
    })
    appointmentDate: Date

    @Prop()
    customerName: string

    @Prop()
    appointmentHour: string

    @Prop()
    detail: string
}

export const CustomerSchema = SchemaFactory.createForClass(Customer)
