import { MessageEventEnums } from '../lib/utils';
import { SocketService } from './socket.service';
import {
  DestroyRef,
  inject,
  Injectable,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { tryCatch } from '../lib/utils';
import { Message } from '../lib/interface/chat.interface';
import { ChatService } from './chat.service';
import {
  AnswerType,
  CandidateType,
  OfferType,
  SyncData,
  TMessageDelivered,
  TMessageReceived,
  TMessageSeen,
  TMessageTyping,
} from '../lib/types';
import { UserService } from './user.service';

import { CallService } from './call.service';
import { HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly socketService = inject(SocketService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatService = inject(ChatService);
  private readonly callService = inject(CallService);

    private readonly router = inject(Router);

  isSocketConnected = signal(false);
  isLoading = signal(false);
  error = signal<undefined | string>(undefined);


  loginHandler  =async (res:HttpResponse<Object>)=>{
    try {
      if (res.status === 401) {
        this.authService.setIsAuth(false);
        this.router.navigate(['/login']);
      } else if (res.status === 200) {
        this.userService.setUser(res?.body!);
        this.authService.setIsAuth(true);
      }
    } catch (error:any) {
      console.log('error from get current user:', error);
      this.error.set(
        error?.error?.message ??
          'Something went wrong, please try login again'
      );
      this.authService.setIsAuth(false);
      this.isLoading.set(false);
      this.router.navigate(['/login']);

    }
  }


  syncHandler = async(data:HttpResponse<SyncData>)=>{
   try {
    if (data.status === 200) {
      if (data.body) {
        this.chatService.setAllGroups(data.body?.groups);
        this.chatService.setAllChats(data.body?.chats);
        this.chatService.setAllUsers(data.body?.users);
      }
    }
   } catch (error:any) {
    console.log('error from get sync all:', error);
   }
  }



  loadChats(url: string) {
    const splitUrl = url.split('/');
    if (splitUrl.length > 2) {
      const id = splitUrl[splitUrl.length - 1];
      const chat = this.chatService.getChat(Number(id));
      if (chat) {
        this.chatService.currentChat = chat;
      }
    }
  }

  // socket handlers
  connectedHandler = async () => {};
  disconnectedHandler = async () => {};

  messageNewHandler = async (data: Message) => {
    this.chatService.addMessage(data);
  };

  messageReceivedHandler = async (data: TMessageReceived) => {
    console.log('message received', data);
    if (this.userService.getUser?.id == data.message.userId) {
      this.chatService.addMessage(data.message);
    } else {
      this.chatService.editMessage(data.message);
    }
  };

  messageTypingHandler = async (data: TMessageTyping) => {
    console.log('typing', data);
    // TODO: change it to reflex changes on the list of chat-list
    // if(data.chatId && data.chatId === this.chatId()){
    //   this.isTyping.set(data.iassTyping)
    // }
  };
  messageSeenHandler = async (data: TMessageSeen) => {
    this.chatService.editMessage(data.message);
  };

  messageDeliveredHandler = async (data: TMessageDelivered) => {
    this.chatService.editMessage(data.message);
  };

  offerCallHandler = async (data: OfferType) => {
    this.callService.handleOffer(data);
  };
  answerCallHandler = (data: AnswerType) => {
    this.callService.handlerAnswer(data);
  };
  iceCandidateHandler = (data: CandidateType) => {
    this.callService.handlerCandidate(data);
  };

  errorHandler = (err: any) => {
    console.error('error from server', err);
  };

  tokenUnauthorizedHandler = (err: any) => {
    console.error('unauthorized', err);

  };
}

