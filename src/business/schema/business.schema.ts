import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AccountTypeEnum } from './account-type.enum';

export type BusinessDocument = HydratedDocument<Business>;

class DayWorkTime {
  @Prop({ type: String })
  morning: string;

  @Prop({ type: String })
  afternoon: string;
}

@Schema()
export class Business {
  @Prop()
  BusinessName: string;

  @Prop()
  BusinessType: string;

  @Prop()
  OwnerFullName: string;

  @Prop({
    type: Object,
    default: {
      state: null,
      city: null,
      detail: null,
    },
  })
  BusinessAddress: object;

  @Prop({
    type: String,
    match: /^09\d{9}$/,
    unique: true,
  })
  BusinessOwnerPhoneNumber: string;

  @Prop({
    type: String,
    enum: AccountTypeEnum,
    default: AccountTypeEnum.NOT_ACTIVE,
  })
  AccountType: string;

  @Prop({
    default: Date.now(),
  })
  BusinessRegisterDate: Date;

  @Prop()
  StartPlanDate: Date;

  @Prop()
  EndPlanDate: Date;

  @Prop({
    type: Object,
    required: true,
    default: {
      Monday: { morning: '', afternoon: '' },
      Tuesday: { morning: '', afternoon: '' },
      Wednesday: { morning: '', afternoon: '' },
      Thursday: { morning: '', afternoon: '' },
      Friday: { morning: '', afternoon: '' },
      Saturday: { morning: '', afternoon: '' },
      Sunday: { morning: '', afternoon: '' },
      Weekend: { morning: '', afternoon: '' },
    },
  })
  WorkTimes: Record<string, DayWorkTime>;

  @Prop({
    match: /^[A-Za-z0-9_-]+$/,
    unique: true,
  })
  BusinessURL: string;

  @Prop()
  BusinessPictureURL: string;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
