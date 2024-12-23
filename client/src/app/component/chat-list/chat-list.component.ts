import { ChatService } from '../../services/chat.service';
import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatListItemComponent } from './chat-list-item/chat-list-item.component';

@Component({
  selector: 'app-chat-list',
  imports: [FormsModule, ChatListItemComponent],
  templateUrl: './chat-list.component.html',
})
export class ChatListComponent {
  private readonly chatService = inject(ChatService);
  searchInput = signal('');
  chats = computed(() => this.chatService.getAllChats());

  isTypingList = signal<(number | boolean)[][]>(
     this.chats().map((chat) => [chat.id, false]));

}
