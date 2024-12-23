import {  Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Chat } from "./chat.entity";
import { ParentEntity } from "./parentEntity";



@Entity('user_chat_association')
export class UserChatAssociation  extends ParentEntity<UserChatAssociation>{

    @PrimaryColumn({type:'varchar', length:15})
    userId:string

    @PrimaryColumn({type:'int'})
    chatId:number


    @ManyToOne(()=>User,user=>user.chats,{onDelete:'CASCADE',})
    @JoinColumn({name:'userId'})
    user:User

    @ManyToOne(()=>Chat,chat=>chat.users, {onDelete:'CASCADE',})
    @JoinColumn({name:'chatId'})
    chat:Chat
    
}
