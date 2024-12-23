import { ChatService } from './../../services/chat.service';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

import { MessagesComponent } from './messages/messages.component';
import { InputComponent } from './input/input.component';
@Component({
  selector: 'app-chat',
  imports: [FormsModule, MessagesComponent, InputComponent],
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  private readonly chatService = inject(ChatService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // if path include groups then chatId is groupId
  chatId = input.required<number>();

  toUserId = computed(
    () =>
      this.chat()?.users.find((u) => u.id !== this.userService.getUser?.id)?.id
  );

  // isTyping event for trigger we start type then trigger typing event
  isTyping = signal(false);
  meUserId = computed(() => this.userService.getUser?.id);
  targetUserId = computed(
    () =>
      this.chatService.currentChat?.users.find(
        (user) => user.id !== this.meUserId()
      )?.id
  );
  messageInput = signal('');

  // if url include groups then chat is group
  chat = computed(() => this.chatService.currentChat);

  private loadChat() {
    if (this.chatId()) {
      const chat = this.chatService.getChat(this.chatId());
      if (chat) {
        this.chatService.currentChat = chat;
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  ngOnInit() {
    this.loadChat();
  }


}
