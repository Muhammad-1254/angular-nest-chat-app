import { Injectable } from "@angular/core";
import {Socket, io} from 'socket.io-client'
import { apiPath, baseUrl } from "../api.path";
import { Observable } from "rxjs";
import { Message } from "../lib/interface/chat.interface";
import { MessageEventEnums, MessageSubscriptionsEnum } from "../lib/utils";



@Injectable({providedIn:'root'})
export class SocketService{

  private socket:Socket

  constructor(){
    this.socket = io(baseUrl,{withCredentials:true})
  }

  emit(eventName:string,data:any):void{
    this.socket.emit(eventName, data)
  }

  on(eventName:string):Observable<any>{
    return new Observable((observer)=>{
      this.socket.on(eventName,(data:any)=>{
        observer.next(data)
      })
    })
  }


  disconnect():void{
    if(this.socket){
      this.socket.disconnect()
    }
  }



}
