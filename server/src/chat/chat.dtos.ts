import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  
} from 'class-validator';
import { isBuffer } from 'util';
import { isArrayBuffer } from 'util/types';

export class CreateChatDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsEmail()
  email: string;
}

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  avatarUrl: string;

  @IsArray()
  members: string[];
}

export class AddMembersToGroupDto {
  @IsArray()
  @IsNotEmpty()
  members: string[];

  @IsNotEmpty()
  @IsInt()
  groupId: number;
}

export class RemoveMembersFromGroupDto extends AddMembersToGroupDto {}

export class RemoveAdminOfGroupDto {
  @IsNotEmpty({ message: 'groupId is required' })
  @IsInt()
  groupId: number;

  @IsNotEmpty({ message: 'adminId is required' })
  @IsString()
  adminId: string;
}

export class UpdatedGroupBasicInfoDto {
  @IsNotEmpty()
  @IsInt()
  groupId: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  avatarUrl: string;
}



class MessageBaseDto{
  @IsPhoneNumber()
  toUserId: string;
  @IsInt()
  chatId:number

  @IsInt()
  groupId: number;

}


export class MessageSendDto extends MessageBaseDto{
  @IsString()
  textContent: string;

  @IsString()
  mediaContent: string;
  
  @IsString()
  mediaType: string;
  
  @IsString()
  @IsEnum(['chat', 'group'])
  messageType: 'chat' | 'group';
  
}





export class MessageTypingDto extends MessageBaseDto{

  @IsBoolean()
  @IsNotEmpty()
  isTyping: boolean;
}

export class MessageSeenDto extends MessageBaseDto{
  @IsNotEmpty()
  @IsInt()
  messageId: number;
}

export class MessageDeliveredDto extends MessageBaseDto{
  @IsNotEmpty()
  @IsInt()
  messageId: number;
}


export class UploadFileDto {
  @IsNotEmpty()
  file: Uint8Array

  mimeType:string

  @IsNumber()
  @IsNotEmpty()
  typeId:number

  @IsString()
  @IsNotEmpty()
  type:'chat'|'group'



  @IsString()
  @IsNotEmpty()
  filename:string
  

  
} 