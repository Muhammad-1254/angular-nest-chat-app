import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: "postgres",
            url: configService.getOrThrow("DATABASE_URL_UNPOOLED"),
            entities: entities,
            // migrations: [join(__dirname, "libs/shared/src/migrations/*{.ts,.js}")],
            // logging: false,
            autoLoadEntities: false,
            synchronize: false,
          }),
        }), 
      ],
    
})
export class DatabaseModule {}
