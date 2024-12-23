import { EntityManager } from 'typeorm';
import { HttpException, Injectable } from '@nestjs/common';

import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, LoginDto } from './dtos/create-user.dto';

import { v4 as uuid } from 'uuid';
import { User } from 'src/database/entities';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { cookieOptions } from 'src/lib/utils';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly entityManager: EntityManager,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // first check if user exist or not
    const userExist = await this.userService.findOne({
      phoneNumber: createUserDto.phoneNumber,
      email: createUserDto.email,
    });
    if (userExist) {
      if (userExist.email === createUserDto.email) {
        throw new HttpException('Email already exist', 400);
      } else if (userExist.id === createUserDto.phoneNumber) {
        throw new HttpException('Phone number already exist', 400);
      }
    }

    const hashPassword = await this.hashPassword(createUserDto.password);
    const user = new User({
      ...createUserDto,
      password: hashPassword,
      id: createUserDto.phoneNumber,
    });
    
    await this.entityManager.save(user);
    const { password, ...result } = user;
    return result;
  }

  async login(res: Response, loginDto: LoginDto) {
    // check credentials
    const user = await this.validateUser(loginDto.password, {
      email: loginDto.email,
      phoneNumber: loginDto.phoneNumber,
    });
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }
    const payload = {
      userId: user.id,
      sub: {
        email: user.email,
      },
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
      secret: `${process.env.JWT_SECRET}`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
      secret: `${process.env.JWT_SECRET}`,
    });

    // set cookie
    return res
      .cookie('access_token', accessToken, cookieOptions)
      .cookie('refresh_token', refreshToken, cookieOptions)
      .status(200)
      .send({ accessToken, refreshToken });
  }

  async validateUser(
    password: string,
    cred: { email?: string; phoneNumber?: string },
  ) {
    const user = await this.userService.findSecureUser(cred);

    if (user && (await this.comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async getAccessToken(encodedRefreshToken: string) {
    const user = await this.verifyJwtToken(encodedRefreshToken);
    console.log('user from getAccessToken', user);
    // checking if user have role for user want's to get refresh token?
    const userExist = await this.userService.findOne({
      phoneNumber: user.userId,
    });
    console.log('userExist from getAccessToken', userExist);

    const payload = {
      userId: user.userId,
      sub: {
        email: user.email,
      },
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_TOKEN_EXPIRY}`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRY}`,
      }),
    };
  }

  async verifyJwtToken(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, {
        ignoreExpiration: false,
        secret: this.configService.get('JWT_SECRET'),
      });
      return {
        email: decoded.sub.email,
        userId: decoded.userId,
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        if (error.message === 'jwt expired') {
          throw new HttpException('Token expired', 401);
        } else if (error.message === 'invalid token') {
          throw new HttpException('Invalid token', 401);
        } else {
          throw new HttpException('Invalid token', 401);
        }
      } else {
        console.log('error in verifyJwtToken', error);
      }
    }
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }
  async comparePassword(plainPassword: string, hashPassword: string) {
    return await bcrypt.compare(plainPassword, hashPassword);
  }
}
