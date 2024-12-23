import { Component, inject, input, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../services/chat.service';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { CallComponent } from '../chats/call/call.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule, MatDialogModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly chatService = inject(ChatService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  chat = computed(() => this.chatService.currentChat);

ngOnInit(){
  // this.openDialog()
}

  openDialog() {
    this.dialog.open(CallComponent, {
      enterAnimationDuration: '50ms',
      exitAnimationDuration: '100ms',
    });
  }
  closeCurrentChat() {
    this.chatService.currentChat = undefined
    this.router.navigate(['/'])
  }
}
