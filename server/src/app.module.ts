import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './database/entities';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [
    ChatModule,
    AuthModule,
    DatabaseModule,
    UserModule,
    CloudinaryModule,
    TypeOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL),
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
