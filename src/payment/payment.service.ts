import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { BusinessService } from 'src/business/business.service';
import { Payment } from './schema/payment.schema';
import { Model, startSession } from 'mongoose';
import { AccountTypeEnum } from 'src/business/schema/account-type.enum';
import { PaidType } from './schema/paid-type.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly authService: AuthService,
    private readonly businessService: BusinessService,
    @InjectModel(Payment.name) private PaymentModel: Model<Payment>,
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
    if(accountType !== AccountTypeEnum.NOT_ACTIVE && startPlan === null && endPlan === null) {
        return {
            status: false,
            message: "free trial is used before"
        }
    }
    const session = await startSession()
    session.startTransaction()

    try {
        await this.businessService.updateBusiness(phoneNumber, {
            $set: { 
                AccountType: AccountTypeEnum.ACTIVE,
                startPlan: new Date(),
                endPlan: new Date(new Date().setDate(new Date().getDate() + 30 ))
            }
        }, session)

        await this.PaymentModel.create({
            phoneNumber,
            businessName: business.bname,
            paidCount: 0,
            paidFor: PaidType.FREE_TRIAL,
            paidDate: new Date()
        })
        await session.commitTransaction() 
    } catch (error) {
        await session.abortTransaction()
        console.error(error.message)
        throw new InternalServerErrorException()
    } finally {
        session.endSession()
    }
  }
}
