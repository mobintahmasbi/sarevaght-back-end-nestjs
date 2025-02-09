import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InteractionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private getApiKey() {
    return '356A70444431497A7644364A7657713176422F5731737271693263775A6F5647666151324A54634C424A4D3D';
  }

  async sendCode(phoneNumber: string, code: string) {
    const key = this.getApiKey();
    const url = `https://api.kavenegar.com/v1/${key}/verify/lookup.json`;
    const level = this.configService.get<string>('STATUS')
    if(level === 'development') {
      console.log(`phoneNumber is : ${phoneNumber} and otp code is : ${code}`);
      return true
    }
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${url}?receptor=${phoneNumber}&token=${code}&template=test-otp`,
        ),
      );
      const { data } = response;
      if (data.return.status === 200) {
        this.logger.info(
          `send otpcode to ${phoneNumber} with messageid: ${data.entries[0].messageid} successfully`,
        );
        return true;
      }
      this.logger.error(`send otpcode to ${phoneNumber} is failed`);
      return false;
    } catch (error) {
      this.logger.error(`send otpcode to ${phoneNumber} is failed`);
      return false;
    }
  }
}
