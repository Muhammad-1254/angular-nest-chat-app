import { Chat, Group, Message } from "./interface/chat.interface";
import { User } from "./interface/user.interface";

export type TMessageTyping = {
  chatId?: number;
  groupId?: number;
  isTyping: boolean;
}
export type TMessageSeen= {
  message: Message
}
export type TMessageDelivered = {
  message: Message
}

export type TMessageReceived = {
  message:Message
}


export  type SyncData = {
      chats: Chat[];
      groups: Group[];
      users: User[];
    };



export type OfferType={
  offer:RTCSessionDescriptionInit,
  targetId:string
}



export type AnswerType={
  answer:RTCSessionDescriptionInit,
  targetId:string

}


export type CandidateType = {
  candidate: RTCIceCandidate;

}
