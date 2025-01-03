import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto, CreateUserDto, LoginDto } from './dtos/create-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Res() res: Response,
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(res, loginDto);
  }
  @Put('change-password')
  async changePassword(
    @Res() res: Response,
    @Body() changePasswordDto: ChangePasswordDto,
  ){

    return await this.authService.changePassword(res,changePasswordDto)
  }

  @Post('get-access-token')
  async getAccessToken(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.getAccessToken(refreshToken);
  }
}
