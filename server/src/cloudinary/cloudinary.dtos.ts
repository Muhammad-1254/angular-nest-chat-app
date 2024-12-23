import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetPresignedUrlDto {

    @IsString()
    @IsNotEmpty()
    mimeType: string;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @IsString()
  @IsNotEmpty()
  type: 'chat' | 'group';

  @IsString()
  @IsNotEmpty()
  filename: string;
}


export class UploadMediaMessageDto extends GetPresignedUrlDto{
  @IsString()
  @IsNotEmpty()
    url:string
}