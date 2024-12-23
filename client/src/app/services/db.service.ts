import { UserService } from './user.service';
import { inject, Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Message, Chat, Group } from '../lib/interface/chat.interface';
import { User } from '../lib/interface/user.interface';

@Injectable({ providedIn: 'root' })
export class DbService extends Dexie {
  private readonly userService = inject(UserService);
 private  chats!: Table<Chat, number>;
 private  groups!: Table<Group, number>;
 private  savedUsers!: Table<User, string>;

  constructor() {
    super('chat_app_db');
    this.version(1).stores({
      chats: 'id,messages,users,createdAt,updatedAt',
      groups:
        'id,name,description,avatarUrl,groupAdmins,messages,users,createdAt,updatedAt',
      savedUsers: 'id,firstName,lastName,email,avatarUrl,createdAt,updatedAt',
    });
  }



  async getAllChats(): Promise<Chat[]> {
    return await this.chats.toArray();
  }
async getAllGroups(): Promise<Group[]> {
    return await this.groups.toArray();
  }
  async getAllSavedUser(): Promise<User[]> {
    return await this.savedUsers.toArray();
  }

  async getMessageOfChat(chatId: number): Promise<Message[]> {
    const chats = await this.chats.where('id').equals(chatId).toArray();
    const messages = chats.find((chat) => chat.id === chatId)?.messages;

    return messages ?? [];
  }

  async getMessageOfGroup(groupId: number): Promise<Message[]> {
    const group = await this.groups.where('id').equals(groupId).toArray();
    const messages = group.find((group) => group.id === groupId)?.messages;
    return messages ?? [];
  }
  async addMessageToChat(message: Message) {
    if (message.chatId) {
      const chat = await this.chats
        .where('id')
        .equals(message.chatId)
        .toArray();
      if (chat.length === 1) {
        chat[0].messages.push(message);
        await this.chats.put(chat[0], message.chatId);
        return;
      }
      console.error('Unexpected Error: chat length is not 1');
    } else {
      console.error('Unexpected Error: chatId is not present');
    }
  }
  async addMessageToGroup(message: Message) {
    if (message.groupId) {
      const group = await this.groups
        .where('id')
        .equals(message.groupId)
        .toArray();
      if (group.length === 1) {
        group[0].messages.push(message);
        await this.groups.put(group[0], message.groupId);
        return;
      }
      console.error('Unexpected Error: group length is not 1');
    } else {
      console.error('Unexpected Error: groupId is not present');
    }
  }
  async addNewChat(chat: Chat) {
    await this.chats.add(chat);
  }
  async addNewGroup(group: Group) {
    await this.groups.add(group);
  }
  async addNewUser(user: User) {
    await this.savedUsers.add(user);
  }


  async updatedChatUser(chatId: number, user: User) {
    const chat = await this.chats.where('id').equals(chatId).toArray();
    if (chat.length === 1) {
      // const myUserId = await this.userService.getUser()
      // TODO: change this to myUserId
      const myUserId = '92-3131158807';
      let index: number;
      if (chat[0].users[0].id === myUserId) index = 0;
      else index = 1;
      chat[0].users[index] = user;
      await this.chats.put(chat[0], chatId);
    } else console.error('Unexpected Error: chat length is not 1');
  }
  async updatedGroupUser(groupId: number, user: User) {
    const group = await this.groups.where('id').equals(groupId).toArray();
    if (group.length === 1) {
      group[0].users.map((user) => {
        if (user.id === user.id) {
          user = user;
        }
      });
      await this.groups.put(group[0], groupId);
    } else console.error('Unexpected Error: group length is not 1');
  }
async updateChats(chats:Chat[]){
  await this.chats.bulkPut(chats);
}
async updateGroups(groups:Group[]){
  await this.groups.bulkPut(groups);
}
async updateSavedUsers(users:User[]){
  await this.savedUsers.bulkPut(users);
}
  async removeUserFromGroup(groupId: number, userId: string) {
    const group = await this.groups.where('id').equals(groupId).toArray();
    if (group.length === 1) {
      group[0].users = group[0].users.filter((user) => {
        return user.id !== userId;
      });
      await this.groups.put(group[0], groupId);
    } else console.error('Unexpected Error: group length is not 1');
  }

  async removeChat(chatId:number){
    await this.chats.delete(chatId);
  }
  async removeGroup(groupId:number){
    await this.groups.delete(groupId);
  }


}
