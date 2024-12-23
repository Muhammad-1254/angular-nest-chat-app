import { IsNotEmpty, IsString } from 'class-validator';

export class SyncSavedUserPostDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsString()
  avatarUrl: string | null;

  @IsString()
  publicKey: string | null;

  @IsNotEmpty()
  @IsString()
  createdAt: Date;

  @IsNotEmpty()
  @IsString()
  updatedAt: Date;
}
