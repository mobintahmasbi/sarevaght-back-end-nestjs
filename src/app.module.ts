import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from './business/business.module';
import { OTPModule } from './otp/otp.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PaymentModule } from './payment/payment.module';
import { AppointmentModule } from './appointment/appointment.module';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './logger.config';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true
  }),
  WinstonModule.forRoot(winstonOptions),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('DATABASE_URL')
    }),
    inject: [ConfigService]
  }),
  ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 1000
  }
  ]),
  BusinessModule,
  OTPModule,
  PaymentModule,
  AppointmentModule
  ],
  controllers: [],
  providers: [{
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }],
})
export class AppModule {}
