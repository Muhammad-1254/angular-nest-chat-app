import { UserService } from './../../../services/user.service';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chat } from '../../../lib/interface/chat.interface';
import moment from 'moment'
import { ChatService } from '../../../services/chat.service';
@Component({
  selector: 'app-chat-list-item',
  imports: [RouterLink],
  templateUrl: './chat-list-item.component.html',
})
export class ChatListItemComponent {
  private readonly userService = inject(UserService);
  private readonly chatService = inject(ChatService);
  chat = input.required<Chat>();
  isTyping = input.required<(number|boolean)[]>();

  title = computed(() => this.extractTitle());
  description = computed(() => this.extractDescription());
  lastMessageDate = computed(() => moment(this.extractLastMessageDate()).startOf('minute').fromNow());

  private extractTitle() {
    const userId = this.userService.getUser.id;
    if (this.chat().users[0].id === userId)
      return (
        this.chat().users[1].firstname + ' ' + this.chat().users[1].lastname
      );
    else
      return (
        this.chat().users[0].firstname + ' ' + this.chat().users[0].lastname
      );
  }
  private extractDescription() {
    if(this.isTyping()&& this.isTyping()[1]){
      return 'Typing...';
    }
    const index = this.chat().messages.length - 1;
    if (this.chat().messages[index].textContent) {
      return this.chat().messages[index].textContent;
    } else {
      return this.chat().messages[index].mediaType;
    }
  }
  private extractLastMessageDate() {
    const index = this.chat().messages.length - 1;
    return this.chat().messages[index].sentAt;
  }

}

