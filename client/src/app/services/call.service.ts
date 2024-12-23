import { computed, ElementRef, inject, Injectable, signal } from '@angular/core';
import { SocketService } from './socket.service';
import { UserService } from './user.service';
import { MessageSubscriptionsEnum } from '../lib/utils';
import { OfferType } from '../lib/types';

@Injectable({
  providedIn: 'root',
})
export class CallService {
  private readonly socketService = inject(SocketService);
  private readonly userService = inject(UserService);
  private localStream!: MediaStream;
  private remoteVideo!: ElementRef<HTMLVideoElement>;

  private meUser = computed(() => this.userService.getUser);
  private peerConnection!: RTCPeerConnection;
  callStatus = signal<'calling' | 'ringing' | 'connected' | undefined>(undefined);

  setRemoteVideoElement(element: ElementRef<HTMLVideoElement>) {
    this.remoteVideo = element;
  }
  getLocalStream() {
    return this.localStream;
  }
  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
  }
  get getPeerConnection() {
    if (!this.peerConnection) {
      this.peerConnection = this.createPeerConnection();
    }
    return this.peerConnection;
  }

  public async handleOffer({offer,targetId}:OfferType) {
    const pc = this.getPeerConnection;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.socketService.emit(MessageSubscriptionsEnum.ANSWER_CALL, {
      targetId:this.meUser()?.id,
      answer: pc.localDescription,
    });
  }

  public async handlerAnswer({ from, to, answer }: any) {
    const pc = this.getPeerConnection;
    await pc.setRemoteDescription(answer);
    this.callStatus.set('connected');
    const data = {
      from,
      to,
      status: this.callStatus(),
    };
    console.log('data: ', data);
    this.socketService.emit('call-status', data);
  }

  public async handlerCandidate(candidate: any) {
    const pc = this.getPeerConnection;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private createPeerConnection() {
    const config: RTCConfiguration = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    };
    this.peerConnection = new RTCPeerConnection(config);

    // add local stream to peer connection
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });
    // listen to remote stream and add to peer connection
    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };
    // listen for ice candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.emit('candidate', event.candidate);
      }
    };
    return this.peerConnection;
  }
}
