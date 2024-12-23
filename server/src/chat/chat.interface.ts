import { Socket } from "socket.io";
import { AuthUser } from "src/lib/utils";




export interface AuthenticatedSocket extends Socket {
    data:AuthUser
}




export type OfferType={
    offer:RTCSessionDescription,
    targetId:string
  }
  
  
  
  export type AnswerType={
    answer:RTCSessionDescription,
    targetId:string
  
  }
  
  
  export type CandidateType = {
    candidate: RTCIceCandidate;
  }
  