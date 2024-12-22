import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BusinessModule } from './business/business.module';
import { OTPModule } from './otp/otp.module';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.development.env'
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('DATABASE_URL')
    }),
    inject: [ConfigService]
  }),
  BusinessModule,
  OTPModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
