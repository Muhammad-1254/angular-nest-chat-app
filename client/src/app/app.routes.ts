import { CanActivateFn, Router, Routes } from '@angular/router';
import { RegisterComponent } from './component/register/register.component';
import { LoginComponent } from './component/login/login.component';
import { MessagesComponent } from './component/chats/messages/messages.component';
import { NoChatComponent } from './component/chats/no-chat/no-chat.component';
import { ChatComponent } from './component/chats/chat.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { chatsRoutes } from './chats.routes';
import { inject } from '@angular/core';

import { AuthService } from './services/auth.service';
import { DetailsComponent } from './component/chats/details/details.component';

const checkAuth: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (!authService.getIsAuth()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', component: NoChatComponent, canActivate: [checkAuth] },
  {
    path: 'chats/:chatId',
    children: chatsRoutes,
    canActivate: [checkAuth],
  },

  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  { path: '**', component: PageNotFoundComponent },
];
