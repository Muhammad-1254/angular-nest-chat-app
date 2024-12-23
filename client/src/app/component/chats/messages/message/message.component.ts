import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DMessage, Message } from '../../../../lib/interface/chat.interface';
import { ChatService } from '../../../../services/chat.service';
import { UserService } from '../../../../services/user.service';
import { NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MediaService } from '../../../../services/media.service';
import moment from 'moment';

@Component({
  selector: 'app-message',
  imports: [NgStyle,MatIconModule],
  templateUrl: './message.component.html',
})
export class MessageComponent{
  private readonly userService = inject(UserService);
  private readonly mediaService= inject(MediaService);

  message = input.required<Message|DMessage>()
  myUserId = input.required<string>()
  mediaMeta = signal<{width:number,height:number,aspectRatio:string}>({width:300,height:300,aspectRatio:"auto"})



  ngOnInit(){
    this.loadMediaMeta()
  }




   getMessageDate(date:Date){
  return   moment(date).format('hh:mm A')

  }



   getDocsName(url:string){
    if(this.message.hasOwnProperty('isDummy')){
      console.log('dummy exist')
    }

    const urlArray = url.split('/')
    const name = urlArray[urlArray.length-1].split('-_-')[1]
    return name
  }

  private   loadMediaMeta(){
    if(this.message().mediaContent ){
      this.mediaService.getMediaMetaData(this.message().mediaContent!)
      .subscribe({
        next:(meta)=>{
          this.mediaMeta.set({width:meta.width,height:meta.height,aspectRatio:`${meta.width}/${meta.height}`})
          console.log("media meta data",meta.width,meta.height)
        },
        error:(error)=>{
          console.log("error in getting media meta data",error)
        }
      })
  }
  }
}
