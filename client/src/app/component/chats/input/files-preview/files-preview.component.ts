import { NgFor, NgIf, NgStyle } from "@angular/common";
import { Component, EventEmitter, input, Output, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";




@Component({
  selector: 'app-input-files-preview',
  imports: [MatIconModule,NgStyle,],
  templateUrl: './files-preview.component.html',
})
export class InputFilePreviewComponent {

  selectedFiles = input.required<{preview:string,file:File}[ ]>()

  @Output() removeFile = new EventEmitter<number>()

  removeFileHandler(index:number){
    this.removeFile.emit(index)
  }





}


