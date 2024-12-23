import { ChatService } from './../../../services/chat.service';
import { UserService } from './../../../services/user.service';
import {
  Component,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
  DestroyRef,
  computed,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { MessageSubscriptionsEnum } from '../../../lib/utils';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CallService } from '../../../services/call.service';
import { OfferType } from '../../../lib/types';

@Component({
  selector: 'app-call',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './call.component.html',
})
export class CallComponent implements OnInit, AfterViewInit {
  private readonly socketService = inject(SocketService);
  private readonly callService = inject(CallService);

  private readonly userService = inject(UserService);
  private readonly chatService = inject(ChatService);

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  type = input.required<'video' | 'audio'>();
  meUserId = computed(() => this.userService.getUser?.id);
  targetUserId = computed(
    () =>
      this.chatService.currentChat?.users.find(
        (user) => user.id !== this.meUserId()
      )?.id
  );
  callStatus = computed(() => this.callService.callStatus());

  async ngOnInit() {
    console.log('ngOnInit call component');
    await this.loadLocalStream();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit call component');
    this.callService.setRemoteVideoElement(this.remoteVideo);
  }

  async startCall() {
    if (!this.meUserId() && !this.targetUserId()) {
      console.log('meUserId or targetUserId is not available');
    }
    const pc = this.callService.getPeerConnection;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const data: OfferType = {
      targetId: this.targetUserId()!,
      offer,
    };
    this.socketService.emit(MessageSubscriptionsEnum.OFFER_CALL, data);
  }

  private async loadLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log({ stream });
      this.callService.setLocalStream(stream);
      this.localVideo.nativeElement.srcObject = stream;
    } catch (error) {
      console.log('error while open local stream: ', error);
    }
  }
}
