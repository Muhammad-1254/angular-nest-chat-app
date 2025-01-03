import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';


export class LoginDto {

  @IsPhoneNumber()
  phoneNumber: string;
  
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}


export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}


export class ChangePasswordDto{
  @IsString()
  @IsNotEmpty()
  email:string;


  // TODO: complete this feature
  @IsString()
  @IsNotEmpty()
  password:string
}