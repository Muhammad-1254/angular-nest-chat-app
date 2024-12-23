import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryController } from './cloudinary.controller';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryProvider, JwtService, AuthService,UserService,],
})
export class CloudinaryModule {}
