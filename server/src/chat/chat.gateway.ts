import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AnswerType, AuthenticatedSocket, CandidateType, OfferType } from './chat.interface';
import { Inject } from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  MessageEventEnums,
  MessageStatusEnum,
  MessageSubscriptionsEnum,
} from 'src/lib/chat.enum';
import { AuthService } from 'src/auth/auth.service';
import { Socket } from 'socket.io';
import { Message } from 'src/database/entities';
import {
  MessageDeliveredDto,
  MessageSeenDto,
  MessageSendDto,
  MessageTypingDto,
  UploadFileDto,
} from './chat.dtos';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer() server: Server;

  async handleDisconnect(socket: AuthenticatedSocket) {
    console.log('handleDisconnect');
    // imp note: socket may have not user data if user if jwt expired
    await this.chatService.removeUserSocket(socket.data.userId);
    if (socket.data?.userId) {
      this.server.to(socket.id).emit(MessageEventEnums.TOKEN_UNAUTHORIZED, {
        status: MessageStatusEnum.UNAUTHORIZED,
      });
    }
    socket.disconnect();
  }
  async handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    console.log('Incoming Connection');
    let token = socket.handshake.headers.authorization ?? null;
    if (!token) {
      // check token from cookies
      token =
        socket.handshake.headers.cookie
          ?.split(';')
          .find((i) => i.includes('access_token')) ?? null;

      if (token) {
        token = token.split('=')[1].trim();
        console.log('token from cookies: ', token);
      } else {
        console.log('No token found');
        await this.handleDisconnect(socket);
        return;
      }
    } else {
      token = token.split(' ')[1];
    }
    console.log('jwt', token);
    let res
    try {
      res = await this.authService.verifyJwtToken(token);
      
    } catch (error) {
      console.log('Error in verifying jwt token:', error);  
      if(error?.message === 'jwt expired'){
        console.log('JWT expired');
        socket.to(socket.id).emit(MessageEventEnums.TOKEN_UNAUTHORIZED, {
          status: MessageStatusEnum.UNAUTHORIZED,
        })
        // const rToken = socket.handshake.headers.cookie
        // ?.split(';')
        // .find((i) => i.includes('refreshToken')) ?? null;
        // if(rToken){
        //   // const newToken = await this.authService.getAccessToken(token);
        //   // console.log('newToken',newToken);
        // }

      }
      
    }
    //  console.log({jwt})

    if (!res?.userId) {
      console.log('Invalid JWT token:', res);
      this.handleDisconnect(socket);
      return;
    }
    socket.data.userId = res.userId;
    socket.data.email = res.email;

    await this.chatService.setUserSocket(socket.data.userId, socket.id);
    // now checking if user is not this means that user have not previous chats
    // await this.getUnreadMessages(socket)
    this.server.to(socket.id).emit(MessageEventEnums.CONNECTED, {
      status: MessageStatusEnum.OK
    });
  }

  // @SubscribeMessage(MessageSubscriptionsEnum.SYNC_DATA)
  // async syncData(@ConnectedSocket() socket: AuthenticatedSocket,
  // ) {
  //   const data = await this.chatService._syncData(socket.data.userId);
  //   this.server.to(socket.id).emit(MessageEventEnums.SYNC_DATA
  //     , data);
  // }
  // getUnreadMessages = async (socket: AuthenticatedSocket) => {
    
  // }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_SEND)
  async messageSend(
    @MessageBody() messageSendDto: MessageSendDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const {
      chatId,
      groupId,
      mediaContent,
      mediaType,
      messageType,
      textContent,
      toUserId,
    } = messageSendDto;
    const newMessage = new Message({
      textContent,
      mediaContent,
      mediaType,
      messageType,
      userId: socket.data.userId,
    });
    if (toUserId && chatId) {
      // one to one chat
      newMessage.chatId = chatId;
      // save to db
      const message = await this.chatService._messageSend(newMessage);
      const userSocket = await this.chatService.getUserSocket(toUserId);
      console.log('user chat socket', userSocket);
      if (userSocket) {
        this.server.to(userSocket).emit(MessageEventEnums.MESSAGE_NEW, message);
      }
      this.server.to(socket.id).emit(MessageEventEnums.MESSAGE_RECEIVED, {message});
    } else if (groupId) {
      // group chat message
      newMessage.groupId = groupId;
      // save to db
      const message = await this.chatService._messageSend(newMessage);
      const members = await this.chatService.getMembersOfGroup(groupId);
      for (const member of members) {
        const userSocket = await this.chatService.getUserSocket(member.userId);
        if (userSocket)
          this.server
            .to(userSocket)
            .emit(MessageEventEnums.MESSAGE_NEW, message);
      }
      this.server.to(socket.id).emit(MessageEventEnums.MESSAGE_RECEIVED, {message});
    } else {
      this.server.to(socket.id).emit(MessageEventEnums.ERROR, {
        message: 'groupId or toUserId is required',
      });
    }
  }
  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_TYPING)
  async messageTyping(
    @MessageBody() messageTypingDto: MessageTypingDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { groupId, isTyping, toUserId, chatId } = messageTypingDto;
    if (toUserId) {
      // one to one chat
      const userSocket = await this.chatService.getUserSocket(toUserId);
      console.log('user chat socket', userSocket);
      if (userSocket)
        this.server
          .to(userSocket)
          .emit(MessageEventEnums.MESSAGE_TYPING, { chatId, isTyping });
    } else if (groupId) {
      // group chat message
      const members = await this.chatService.getMembersOfGroup(groupId);
      for (const member of members) {
        const userSocket = await this.chatService.getUserSocket(member.userId);
        if (userSocket)
          this.server
            .to(userSocket)
            .emit(MessageEventEnums.MESSAGE_TYPING, { groupId, isTyping });
      }
    } else {
      this.server.to(socket.id).emit(MessageEventEnums.ERROR, {
        message: 'groupId or toUserId is required',
      });
    }
  }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_SEEN)
  async messageSeen(
    @MessageBody() messageSeenDto: MessageSeenDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { groupId, toUserId, chatId, messageId } = messageSeenDto;
    if (toUserId) {
      // one to one chat
      const message = await this.chatService._messageSeen(messageId);
      const userSocket = await this.chatService.getUserSocket(toUserId);
      console.log('user chat socket', userSocket);
      if (userSocket)
        this.server
          .to(userSocket)
          .emit(MessageEventEnums.MESSAGE_SEEN, { message });
    } else if (groupId) {
      // group chat message
      const message = await this.chatService._messageSeen(messageId);
      const members = await this.chatService.getMembersOfGroup(groupId);
      for (const member of members) {
        const userSocket = await this.chatService.getUserSocket(member.userId);
        if (userSocket)
          this.server
            .to(userSocket)
            .emit(MessageEventEnums.MESSAGE_SEEN, { message });
      }
    } else {
      this.server.to(socket.id).emit(MessageEventEnums.ERROR, {
        message: 'groupId or toUserId is required',
      });
    }
  }

  @SubscribeMessage(MessageSubscriptionsEnum.MESSAGE_DELIVERED)
  async messageDelivered(
    @MessageBody() messageDeliveredDto: MessageDeliveredDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { groupId, toUserId, chatId, messageId } = messageDeliveredDto;
    if (toUserId) {
      // one to one chat
      const message = await this.chatService._messageDelivered(messageId);
      const userSocket = await this.chatService.getUserSocket(toUserId);
      console.log('user chat socket', userSocket);
      if (userSocket)
        this.server
          .to(userSocket)
          .emit(MessageEventEnums.MESSAGE_DELIVERED, { message });
    } else if (groupId) {
      // group chat message
      const message = await this.chatService._messageDelivered(messageId);
      const members = await this.chatService.getMembersOfGroup(groupId);
      for (const member of members) {
        const userSocket = await this.chatService.getUserSocket(member.userId);
        if (userSocket)
          this.server
            .to(userSocket)
            .emit(MessageEventEnums.MESSAGE_DELIVERED, { message });
      }
    } else {
      this.server.to(socket.id).emit(MessageEventEnums.ERROR, {
        message: 'groupId or toUserId is required',
      });
    }
  }

  // @SubscribeMessage(MessageSubscriptionsEnum.Upload_FILE)
  // async uploadFilesHandler(
  //   @MessageBody() uploadFileDto: UploadFileDto,
  //   @ConnectedSocket() socket: AuthenticatedSocket,
  // ){
  //   const {status,message} =await this.chatService._uploadFilesHandler(socket.data, uploadFileDto);
  //   if(status==201){
  //     this.server.to(socket.id).emit(MessageEventEnums.MESSAGE_RECEIVED, {message});
  //   }else{
  //     this.server.to(socket.id).emit(MessageEventEnums.ERROR, {message});
  //   }
    
  // }

  @SubscribeMessage(MessageSubscriptionsEnum.OFFER_CALL)
  async handleOfferCall(socket: AuthenticatedSocket,data:OfferType){
    const userSocket = await this.chatService.getUserSocket(data.targetId)
    console.log("offerCall: ",{userSocket,data:data})
    if(userSocket){
      this.server.to(userSocket).emit(MessageEventEnums.OFFER_CALL,data)
    }
  }


  @SubscribeMessage(MessageSubscriptionsEnum.ANSWER_CALL)
  async handleAnswerCall(socket: AuthenticatedSocket,data:AnswerType){
    const userSocket = await this.chatService.getUserSocket(data.targetId)
    console.log("answerCall: ",{userSocket,data:data})
    if(userSocket){
      this.server.to(userSocket).emit(MessageEventEnums.ANSWER_CALL,data)
    }
  }

  @SubscribeMessage(MessageSubscriptionsEnum.ICE_CANDIDATE)
 async handleIceCandidate(socket: AuthenticatedSocket,data:CandidateType){
  socket.broadcast.emit(MessageEventEnums.ICE_CANDIDATE,data) 
}

@SubscribeMessage(MessageSubscriptionsEnum.CALL_ENDED)
async handleCallEnded(socket: AuthenticatedSocket,data:{targetId:string}){
  const userSocket = await this.chatService.getUserSocket(data.targetId)
  console.log("callEnded: ",{userSocket,data:data})
  if(userSocket){
    this.server.to(userSocket).emit(MessageEventEnums.CALL_ENDED,{from:socket.data.userId,targetId:data.targetId})
  }
  this.server.to(socket.id).emit(MessageEventEnums.CALL_ENDED,{from:socket.data.userId,targetId:data.targetId})
}



}
