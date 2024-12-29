import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from './business/business.module';
import { OTPModule } from './otp/otp.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.development.env',
    isGlobal: true
  }),
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
  OTPModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
