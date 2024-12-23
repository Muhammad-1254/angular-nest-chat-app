import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { ChatListComponent } from './component/chat-list/chat-list.component';
import { HttpClient } from '@angular/common/http';
import { apiPath } from './api.path';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './component/header/header.component';
import { SocketService } from './services/socket.service';
import { MessageEventEnums, } from './lib/utils';
import { UserComponent } from './component/user/user.component';
import { AppService } from './services/app.service';
import { SyncData } from './lib/types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatListComponent, HeaderComponent, UserComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly appService = inject(AppService);
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly socketService = inject(SocketService);

  private readonly destroyRef = inject(DestroyRef);

  isUserLoggedIn = computed(() => this.authService.getIsAuth());
  isLoading = computed(() => this.appService.isLoading());
  // isSyncing = signal<boolean>(false);
  error = signal<undefined | string>(undefined);

  constructor() {
    effect(() => {
      if (this.error()) {
        // window.alert(this.error());
        console.log("error in app.component.ts", this.error());
      }

      // for dynamic header changes when chat is open
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          // Navigation is starting... show a loading spinner perhaps?
          // blog on that here: ultimatecourses.com/blog/angular-loading-spinners-with-router-events
        }
        if (event instanceof NavigationEnd) {
          this.appService.loadChats(event.url);
        }
        if (event instanceof NavigationError) {
          // something went wrong, log the error
          console.log(event.error);
        }
      });
    });
  }

  async ngOnInit(): Promise<void> {
    const loginS = this.httpClient
      .get(apiPath.getCurrentUser, {
        observe: 'response',
        withCredentials: true,
      })
      .subscribe(this.appService.loginHandler);

    // sync data
    const syncS = this.httpClient
      .get<SyncData>(apiPath.getSyncAll, {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe(this.appService.syncHandler);

    // listen for new messages
    const connectedS = this.socketService
      .on(MessageEventEnums.CONNECTED)
      .subscribe(this.appService.connectedHandler);
    const disconnectedS = this.socketService
      .on(MessageEventEnums.DISCONNECTED)
      .subscribe(this.appService.disconnectedHandler);

    const messageNewS = this.socketService
      .on(MessageEventEnums.MESSAGE_NEW)
      .subscribe(this.appService.messageNewHandler);
    const messageReceivedS = this.socketService
      .on(MessageEventEnums.MESSAGE_RECEIVED)
      .subscribe(this.appService.messageReceivedHandler);
    const messageTypingS = this.socketService
      .on(MessageEventEnums.MESSAGE_TYPING)
      .subscribe(this.appService.messageTypingHandler);
    const messageSeenS = this.socketService
      .on(MessageEventEnums.MESSAGE_SEEN)
      .subscribe(this.appService.messageSeenHandler);
    const messageDeliveredS = this.socketService
      .on(MessageEventEnums.MESSAGE_DELIVERED)
      .subscribe(this.appService.messageDeliveredHandler);

    const offerCallS = this.socketService
      .on(MessageEventEnums.OFFER_CALL)
      .subscribe(this.appService.offerCallHandler);

    const answerCallS = this.socketService
      .on(MessageEventEnums.ANSWER_CALL)
      .subscribe(this.appService.answerCallHandler);

    const iceCandidateS = this.socketService
      .on(MessageEventEnums.ICE_CANDIDATE)
      .subscribe(this.appService.iceCandidateHandler);
    const ErrorS = this.socketService
      .on(MessageEventEnums.ERROR)
      .subscribe(this.appService.errorHandler);
    const TokenUnauthorizedS = this.socketService
      .on(MessageEventEnums.TOKEN_UNAUTHORIZED)
      .subscribe(this.appService.tokenUnauthorizedHandler);

    this.destroyRef.onDestroy(() => {
      loginS.unsubscribe();
      syncS.unsubscribe();
      connectedS.unsubscribe();
      disconnectedS.unsubscribe();
      messageNewS.unsubscribe();
      messageReceivedS.unsubscribe();
      messageTypingS.unsubscribe();
      messageSeenS.unsubscribe();
      messageDeliveredS.unsubscribe();
      offerCallS.unsubscribe();
      answerCallS.unsubscribe();
      iceCandidateS.unsubscribe();
      ErrorS.unsubscribe();
      TokenUnauthorizedS.unsubscribe();
    });
  }
}
