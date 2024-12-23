import { User } from './user.interface';

export interface Message {
  id: number;
  userId: string;
  chatId: number | null;
  groupId: number | null;
  textContent: string | null;
  mediaContent: string | null;
  mediaType: string | null;
  messageType: 'chat' | 'group';
  deliveredAt: Date | null;
  seenAt: Date | null;
  sentAt: Date;

  createdAt: Date;
  updatedAt: Date;
}


export interface DMessage extends Partial<Message>{
  isDummy: boolean;
}

export interface Chat {
  id: number;
  messages: Message[];
  users: User[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  groupAdmins: User[];
  messages: Message[];
  users: User[];

  createdAt: Date;
  updatedAt: Date;
}

export interface GetPresignedUrl {
  filename: string;
  mimeType: string;
  type: 'chat' | 'group';
  typeId: number;
}

export interface UploadMediaMessage extends GetPresignedUrl {
  url: string;
}
