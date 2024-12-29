import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class RegisterationGuard implements CanActivate{
    constructor(private readonly authService: AuthService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()
        const { token } = req.body
        if(token === undefined) {
            return false
        }
        try {
            const decodedToken = this.authService.verifyToken(token)
            if(decodedToken.registerToken === true) {
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }
}