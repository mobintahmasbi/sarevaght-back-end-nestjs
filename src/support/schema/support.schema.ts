import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { supportStatus } from "./support-status.enum";

export type SupportDocument = HydratedDocument<Support>

@Schema()
export class Support{
    @Prop()
    title: string

    @Prop()
    description: string

    @Prop({
        type: String,
        match: /^09\d{9}$/
    })
    phoneNumber: string

    @Prop({
        type: String,
        enum: supportStatus,
        default: supportStatus.ACTIVE
    })
    status: string

    @Prop({
        default: Date.now()
    })
    createdAt: Date
}

export const SupportSchema = SchemaFactory.createForClass(Support)
