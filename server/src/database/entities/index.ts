import { CreateDateColumn, Entity, UpdateDateColumn } from "typeorm"
import { Chat } from "./chat.entity"
import { Group } from "./group.entity"
import { Message } from "./message.entity"
import { UserChatAssociation } from "./user-chat-association.entity"
import { UserGroupAssociation } from "./user-group-association.entity"
import { User } from "./user.entity"

export * from "./chat.entity"
export * from "./group.entity"
export * from "./message.entity"
export * from "./user-chat-association.entity"
export * from "./user-group-association.entity"
export * from "./user.entity"


export const  entities = [
    Chat,
    Group,
    User,
    Message,
    Group,
    UserChatAssociation,
    UserGroupAssociation
]