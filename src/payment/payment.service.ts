import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { BusinessService } from 'src/business/business.service';
import { Payment } from './schema/payment.schema';
import mongoose, { Model, startSession } from 'mongoose';
import { AccountTypeEnum } from 'src/business/schema/account-type.enum';
import { PaidType } from './schema/paid-type.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly authService: AuthService,
    private readonly businessService: BusinessService,
    @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async activateFreeTrial(token: string) {
    const { status, accountType, startPlan, endPlan, phoneNumber, business } =
      await this.businessService.checkBusinessForActivation(token, false);
    
    if(!status) {
        return {
            status: false,
            message: "free trial don't start because the information are not complete!!!"
        }
    }
    if(accountType !== AccountTypeEnum.NOT_ACTIVE && startPlan !== null && endPlan !== null) {
        return {
            status: false,
            message: "free trial is used before"
        }
    }
    const session = await this.connection.startSession()
    session.startTransaction()
    
    try {
        await this.businessService.updateBusiness(phoneNumber, {
            $set: { 
                AccountType: AccountTypeEnum.ACTIVE,
                StartPlanDate: new Date(),
                EndPlanDate: new Date(new Date().setDate(new Date().getDate() + 30 ))
            }
        }, session)

        await this.PaymentModel.create([{
            phoneNumber,
            businessName: business.bname,
            paidCount: 0,
            paidFor: PaidType.FREE_TRIAL,
            paidDate: new Date()
        }], { session })
        await session.commitTransaction()
        return {
            status: true,
            message: "free trial is started for one month!!!"
        } 
    } catch (error) {
        await session.abortTransaction()
        console.error(error.message)
        return new InternalServerErrorException()
    } finally {
        session.endSession()
    }
  }
}
