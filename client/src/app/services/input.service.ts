import { Injectable, signal } from "@angular/core";


@Injectable({providedIn:'root'})
export class InputService {
  selectedFiles =signal<{preview:string,file:File}[ ]>( [])



}
