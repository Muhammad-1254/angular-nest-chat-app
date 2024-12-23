import { Routes } from '@angular/router';
import { NoChatComponent } from './component/chats/no-chat/no-chat.component';
import { ChatComponent } from './component/chats/chat.component';
import { DetailsComponent } from './component/chats/details/details.component';
import { CallComponent } from './component/chats/call/call.component';

export const chatsRoutes: Routes = [
  {
    path: '',
    component: ChatComponent,
  },
  {
    path: 'call',
    component: CallComponent,
  },

  {
    path: 'details',
    component: DetailsComponent,
  },
  {
    path: '**',
    component: NoChatComponent,
  },
];
