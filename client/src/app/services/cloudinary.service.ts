import { UploadMediaMessage } from './../lib/interface/chat.interface';



import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiPath } from '../api.path';
import { GetPresignedUrl } from '../lib/interface/chat.interface';


@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {

  constructor(private http: HttpClient) {}

  getUploadUrl(fileInfo: GetPresignedUrl) {
    return this.http.get(apiPath.getPresignedUrl, {params: {...fileInfo},withCredentials:true});
  }


  uploadFileToCloudinary(url: string, formData: FormData) {
    return  this.http.post(url, formData, { reportProgress: true, });
  }

  uploadMediaMessage(data:UploadMediaMessage){
    return this.http.post(apiPath.uploadMediaMessage,data, {withCredentials:true})
  }
}
