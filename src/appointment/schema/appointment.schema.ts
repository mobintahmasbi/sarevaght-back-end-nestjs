import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { AppointmentStatusEnum } from "./appointment-status.enum";

export type AppointmentDocument = HydratedDocument<Appointment>

@Schema()
export class Appointment {
    @Prop()
    dayname: string

    @Prop({
        type: String,
        enum: AppointmentStatusEnum,
        default: AppointmentStatusEnum.OPEN
    })
    status: string

    @Prop()
    businessName: string

    @Prop()
    businessURL: string

    @Prop()
    businessPhoneNumber: string

    @Prop({ type: Map, of: Object })
    appointmentsObj: Map<string, object>

    @Prop({
        default: () => Date.now()
    })
    createdAt: Date
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)
