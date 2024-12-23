import { AuthService } from './../auth/auth.service';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import {
    BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { cookieOptions } from 'src/lib/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse()
    const accessToken = this.getTokenFromHeaderOrCookie(req, 'access_token');
    const refreshToken = this.getTokenFromHeaderOrCookie(req, 'refresh_token');
    if(!accessToken || !refreshToken){
      console.error("Token not found in auth guard")
        throw new UnauthorizedException('Token not found');
    }
    try {
        const decoded =await this.verifyToken(accessToken,refreshToken, res);
        req.user = decoded;
    } catch (error) {
        throw new UnauthorizedException('Invalid Token');
    }
    return true;
  }

  private getTokenFromHeaderOrCookie(
    req: Request,
    tokenKey: string,
  ): string | null {
    const tokenFromHeader = req.headers[tokenKey] as string;
    if (tokenFromHeader) {
      // console.log("tokenFromHeader")
      return tokenFromHeader;
    }
    // check for cookie
    // console.log("cookies: ",req?.cookies)
    const tokenFromCookie = req.cookies ? req.cookies[tokenKey] : null;
    // console.log("tokenFromCookie: ",tokenFromCookie )
    return tokenFromCookie;
  }

  private async verifyToken(aToken: string, rToken: string, res:Response): Promise<any> {
    let attempt = 0;
    while (attempt < 2) {
        try {
            const decoded = await this.jwtService.verify(aToken, {
                ignoreExpiration: false,
                secret: this.configService.get('JWT_SECRET'),
            });
            // now check if attempt is 1 and token is correct then set the token to cookies only if exist?
            if(attempt===1){
              console.log("setting the token to cookie")
              res
               .cookie('access_token', aToken, cookieOptions)
              .cookie('refresh_token', rToken, cookieOptions)
            }

            return { userId: decoded.userId, email: decoded.sub.email };
        } catch (error) {
            if (error instanceof JsonWebTokenError && error.message === 'jwt expired') {
                if (attempt === 1) throw new BadRequestException('Token expired');
                const tokens = await this.authService.getAccessToken(rToken);
                aToken = tokens.accessToken;
                rToken = tokens.refreshToken;
                attempt++;
            } else {
                console.error('Token verification failed:', error.message);
                throw new BadRequestException('Invalid token');
            }
        }
    }
}

}
