import { UserService } from './../../../services/user.service';
import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, OnChanges, signal, ViewChild } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { FormsModule, NgModel } from '@angular/forms';
import { Chat, Message } from '../../../lib/interface/chat.interface';
import { MessageComponent } from "./message/message.component";

@Component({
  selector: 'app-messages',
  imports: [FormsModule, MessageComponent, ],
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements AfterViewInit, OnChanges {
  private readonly userService= inject(UserService);
  private readonly chatService= inject(ChatService);

  dummyMessages = computed(()=>this.chatService.getDummyMessages)
  myUserId = computed(()=>this.userService.getUser?.id)
  chat = input<Chat|undefined>(undefined)
  @ViewChild("messagesContainer") messagesContainer!:ElementRef<HTMLDivElement>
constructor(){

}
  ngOnChanges() {
    console.log('ngOnChanges')
      this.scrollToBottom();
}

  ngAfterViewInit() {
    console.log('afterView Init')

  this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }


}
