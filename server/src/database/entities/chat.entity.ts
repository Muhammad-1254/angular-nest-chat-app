import {  Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './message.entity';
import { UserChatAssociation } from './user-chat-association.entity';
import { ParentEntity } from "./parentEntity";

@Entity('chats')
export class Chat extends ParentEntity<Chat> {
  
  @PrimaryGeneratedColumn({ type: 'int', })
  id: number;

  @OneToMany(() => Message, (message) => message.chat,{cascade:true})
  messages: Message[];

  @OneToMany(
    () => UserChatAssociation,
    (userChatAssociation) => userChatAssociation.chat,
    {cascade:true}
  )
  users: UserChatAssociation[];
}
