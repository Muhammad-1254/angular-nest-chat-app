import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports:[CloudinaryModule],
  controllers: [ChatController],

  providers: [ChatService, AuthService, UserService, JwtService, ChatGateway, CloudinaryService],
})
export class ChatModule {}
