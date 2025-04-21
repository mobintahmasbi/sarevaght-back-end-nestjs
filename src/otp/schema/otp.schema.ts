import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OTPDocument = HydratedDocument<OTP>;

@Schema()
export class OTP {
  @Prop({
    unique: true,
    index: true,
    match: /^09\d{9}$/,
  })
  phoneNumber: string;

  @Prop({
    match: /^\d{5}$/, 
    required: true,
  })
  OtpCode: string;

  @Prop({
    default: () => new Date()
  })
  createdAt: Date;

  @Prop({
    default: () => new Date(new Date().getTime() + 60 * 1000),
    expires: 60,
  })
  ExpiredAt: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
