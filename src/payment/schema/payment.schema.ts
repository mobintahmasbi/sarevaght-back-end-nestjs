import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaidType } from './paid-type.enum';

export type PaymentDocument = HydratedDocument<Payment>

@Schema()
export class Payment{
    @Prop({
        required: true,
        index: true
    })
    phoneNumber: string

    @Prop({
        required: true
    })
    businessName: string

    @Prop({
        min: 0
    })
    paidCount: string

    @Prop({
        type: String,
        enum: PaidType,
        required: true
    })
    paidFor: string

    @Prop({
        default: Date.now()
    })
    paidDate: Date
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)