import { sortByDate } from './../lib/utils';
import { inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Chat, DMessage, Group, Message } from '../lib/interface/chat.interface';
import { User } from '../lib/interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  // private readonly dbService = inject(DbService);

  // this for which current chat is open
  private chat = signal<Chat | Group | undefined>(undefined);

  private chats = signal<Chat[]>([]);
  private groups = signal<Group[]>([]);
  private users = signal<User[]>([]);
  // private savedUsers = signal<User[]>([]);

  // async ngOnInit() {
  //   // load chats from local db
  //   this.chats.set(await this.dbService.getAllChats());
  //   this.groups.set(await this.dbService.getAllGroups());
  //   this.savedUsers.set(await this.dbService.getAllSavedUser());
  // }
  // async ngOnDestroy() {
  //   // save chats to local db
  //   await this.dbService.updateChats(this.chats());
  //   await this.dbService.updateGroups(this.groups());
  //   await this.dbService.updateSavedUsers(this.savedUsers());
  // }






  // for dummy chat
  private dummyMessages = signal<DMessage[]>([]);

  set setDummyMessages(messages:DMessage[]) {
    this.dummyMessages.set(messages);
  }
  get getDummyMessages() {
    return this.dummyMessages();
  }
  removeDummyMessage(messageId: number) {
    this.dummyMessages.update((messages) => {
      return messages.filter((message) => message.id !== messageId);
    });
  }
  updateDummyMessage(message: Message) {
    this.dummyMessages.update((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        messages[index] = {...message,isDummy:true};
      }
      return messages
    })
  }

  // for dummy chat till here


  get currentChat() {
    return this.chat();
  }

  set currentChat(chat: Chat | Group | undefined) {
    if (chat) {
      chat.messages = sortByDate(chat.messages, 'createdAt', 'asc');
    }
    this.chat.set(chat);
  }

  setAllChats(chats: Chat[]) {
    this.chats.set(chats);
  }

  getAllChats() {
    return this.chats();
  }
  getChat(chatId: number): Chat | Group | undefined {
    return this.chats().find((chat) => chat.id == chatId);
  }

  addChat(chat: Chat) {
    this.chats.update((chats) => {
      chats.push(chat);
      return chats;
    });
  }

  removeChat(chatId: number) {
    this.chats.update((chats) => {
      return chats.filter((chat) => chat.id !== chatId);
    });
  }

  addMessage(message: Message) {
    if (message.messageType == 'chat') {
      this.chats.update((chats) => {
        chats.forEach((chat) => {
          if (chat.id == message.chatId) {
            chat.messages.push(message);
          }
        });
        return chats;
      });
    } else if (message.messageType == 'group') {
      this.groups.update((groups) => {
        groups.forEach((group) => {
          if (group.id == message.groupId) {
            group.messages.push(message);
          }
        });
        return groups;
      });
    }
  }
  editMessage(message: Message) {
    if (message.messageType == 'chat') {
      this.chats.update((chats) => {
        const chat = chats.find((chat) => chat.id == message.chatId);
        if (chat) {
          const index = chat.messages.findIndex((m) => m.id == message.id);
          if (index != -1) {
            chat.messages[index] = message;
          }
        }
        return chats;
      });
    } else if (message.messageType == 'group') {
      this.groups.update((groups) => {
        const group = groups.find((group) => group.id == message.groupId);
        if (group) {
          const index = group.messages.findIndex((m) => m.id == message.id);
          if (index != -1) {
            group.messages[index] = message;
          }
        }
        return groups;
      });
    }
  }
  removeMessageFromChat(messageId: number, chatId: number) {
    this.chats.update((chats) => {
      const chat = chats.find((chat) => chat.id === chatId);
      if (chat) {
        chat.messages = chat.messages.filter(
          (message) => message.id !== messageId
        );
      }
      return chats;
    });
  }
  updateMessageInChat(message: Message) {
    this.chats.update((chats) => {
      const chat = chats.find((chat) => chat.id === message.chatId);
      if (chat) {
        const index = chat.messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          chat.messages[index] = message;
        }
      }
      return chats;
    });
  }
  setAllGroups(groups: Group[]) {
    this.groups.set(groups);
  }
  getAllGroups() {
    return this.groups();
  }

  addGroup(group: Group) {
    this.groups.update((groups) => {
      groups.push(group);
      return groups;
    });
  }
  removeGroup(groupId: number) {
    this.groups.update((groups) => {
      return groups.filter((group) => group.id !== groupId);
    });
  }
  addMessageToGroup(message: Message) {
    if (message.groupId) {
      this.groups.update((groups) => {
        const group = groups.find((group) => group.id == message.groupId);
        if (group) {
          group.messages.push(message);
        }
        return groups;
      });
    }
  }
  editMessageToGroup(message: Message) {
    this.groups.update((groups) => {
      const group = groups.find((group) => group.id == message.groupId);
      if (group) {
        const index = group.messages.findIndex((m) => m.id == message.id);
        if (index !== -1) {
          group.messages[index] = message;
        }
      }
      return groups;
    });
  }
  updateMessageToGroup(message: Message) {
    this.groups.update((groups) => {
      const group = groups.find((group) => group.id === message.groupId);
      if (group) {
        const index = group.messages.findIndex((m) => m.id === message.id);
        if (index !== -1) {
          group.messages[index] = message;
        }
      }
      return groups;
    });
  }
  updateGroup(group: Group) {
    this.groups.update((groups) => {
      const index = groups.findIndex((g) => g.id === group.id);
      if (index !== -1) {
        groups[index] = group;
      }
      return groups;
    });
  }
  removeMessageFromGroup(messageId: number, groupId: number) {
    this.groups.update((groups) => {
      const group = groups.find((group) => group.id === groupId);
      if (group) {
        group.messages = group.messages.filter(
          (message) => message.id !== messageId
        );
      }
      return groups;
    });
  }

  getAllUsers() {
    return this.users();
  }
  setAllUsers(users: User[]) {
    this.users.set(users);
  }
  getUser(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }
  addUser(user: User) {
    this.users.update((users) => {
      users.push(user);
      return users;
    });
  }
  updateUser(user: User) {
    this.users.update((users) => {
      const index = users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
      }
      return users;
    });
  }

  //   getAllSavedUsers() {
  //     return this.savedUsers();
  //   }
  //   async addSavedUser(user: User) {
  //     this.savedUsers.update((users) => {
  //       users.push(user);
  //       return users;
  //     });
  //   }
  //   updateSavedUser(user: User) {
  //     this.savedUsers.update((users) => {
  //       const index = users.findIndex((u) => u.id === user.id);
  //       if (index !== -1) {
  //         users[index] = user;
  //       }
  //       return users;
  //     });
  //   }
  //   removeSavedUser(userId: string) {
  //     this.savedUsers.update((users) => {
  //       return users.filter((user) => user.id !== userId);
  //     });
  //   }








}
