import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Business } from 'src/business/schema/business.schema';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(phoneNumber: string, businessObj: Business) {
    const token = await this.jwtService.signAsync(
      {
        phoneNumber,
        business: {
          bname: businessObj.BusinessName,
          btype: businessObj.BusinessType,
          fullName: businessObj.OwnerFullName,
        },
        registerToken : false
      },
      {
        expiresIn: '7d',
      },
    );
    return token;
  }

  async generateRegisterToken(phoneNumber: string) {
    const token = await this.jwtService.signAsync(
      { phoneNumber, registerToken: true },
      {
        expiresIn: '30m',
      },
    );
    return token;
  }

  verifyToken(token: string) {
    const decodedToken = this.jwtService.verify(token);
    return decodedToken;
  }

  decodeToken(token: string) {
    const decodedToken = this.jwtService.decode(token)
    return decodedToken
  }
}
