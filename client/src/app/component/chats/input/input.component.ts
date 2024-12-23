import { UserService } from './../../../services/user.service';
import { ChatService } from './../../../services/chat.service';
import { CloudinaryService } from './../../../services/cloudinary.service';
import { SocketService } from './../../../services/socket.service';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageSubscriptionsEnum } from '../../../lib/utils';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { InputFilePreviewComponent } from './files-preview/files-preview.component';
import { Message } from '../../../lib/interface/chat.interface';

@Component({
  selector: 'app-input',
  imports: [FormsModule, MatIconModule, InputFilePreviewComponent],
  templateUrl: './input.component.html',
})
export class InputComponent implements OnInit {
  private socketService = inject(SocketService);
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private readonly cloudinaryService = inject(CloudinaryService);
  private router = inject(Router);
  messageInput = signal('');
  toUserId = input.required<string | undefined>();
  meUserId = computed(() => this.userService.getUser?.id);
  chatId = input.required<number>();

  uploadProgress = signal<
    { progress: number; files: FileList; total: number } | undefined
  >(undefined);
  selectedFiles = signal<{ preview: string; file: File }[]>([]);
  @ViewChild('fileUpload') fileInput!: ElementRef<HTMLInputElement>;

  private chatType!: 'chat' | 'group';
  ngOnInit(): void {
    this.chatType = this.router.url.includes('group') ? 'group' : 'chat';
  }

  onFileInputChangeHandler(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles.update((prev) => {
        const newArray = Array.from(input.files!).map((file) => {
          let preview: string;
          if (file.type.startsWith('image')) {
            preview = URL.createObjectURL(file);
          } else if (file.type.startsWith('video')) {
            preview = URL.createObjectURL(file);
          } else {
            preview = URL.createObjectURL(file);
          }
          return { preview, file: file };
        });
        return [...prev, ...newArray];
      });
    }
  }
  async sendFileHandler() {
    console.log('send files handler');
    for (const [index,file ]of this.selectedFiles().entries()) {
      //get presigned url
      const fileInfo = {
        filename: file.file.name,
        mimeType: file.file.type,
        type: this.chatType,
        typeId: this.chatId(),
      };
      // setDummyChat here
      this.chatService.setDummyMessages = [
        ...this.chatService.getDummyMessages,
        {
          id: index,
          chatId: this.chatId(),
          mediaType: fileInfo.mimeType,
          mediaContent: file.preview,
          messageType: this.chatType,
          userId: this.meUserId()!,
          isDummy:true
        },
      ];
      // get  upload url from server
      this.cloudinaryService
        .getUploadUrl(fileInfo)
        .subscribe((response: any) => {
          console.log({ response });
          const formData = new FormData();
          formData.append('file', file.file);
          formData.append('api_key', response.params.api_key);
          formData.append('signature', response.params.signature);
          formData.append('timestamp', response.params.timestamp);
          formData.append('public_id', response.params.public_id);
          formData.append('folder', response.params.folder);

          // upload file to cloudinary
          this.cloudinaryService
            .uploadFileToCloudinary(response.url, formData)
            .subscribe((res: any) => {
              console.log('response from cloudinary', res);
              // now hit api to send to server that this images is uploaded
              this.cloudinaryService
                .uploadMediaMessage({
                  ...fileInfo,
                  url: res?.secure_url ?? res?.url,
                })
                .subscribe((finalRes: any) => {
                  console.log('final response from server', finalRes);
                  // add message to chat
                  this.chatService.addMessage(finalRes);
                  // remove dummy chat
                  this.chatService.removeDummyMessage(0);
                });
            });
        });
    }
    this.selectedFiles.set([]);
  }

  removeFilesHandler(index: number) {
    console.log({ index });
    this.selectedFiles.set(this.selectedFiles().filter((_, i) => i !== index));
  }
  async sendMessageHandler() {
    if (this.toUserId() && this.messageInput().trim().length > 0) {
      this.socketService.emit(MessageSubscriptionsEnum.MESSAGE_SEND, {
        textContent: this.messageInput(),
        messageType: 'chat',
        toUserId: this.toUserId(),
        chatId: this.chatId(),
      });
      this.messageInput.set('');
    }
  }
}
