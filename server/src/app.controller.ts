import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,

  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('files',{limits:{files:5},}))
  // async uploadImage(
  //   @UploadedFile() files:Express.Multer.File
  // ){
  //   // console.log(files)
  //   return await this.cloudinaryService.uploadFile(files,'changeFileName')
  // }
}
