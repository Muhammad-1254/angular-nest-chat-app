import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request, Response } from 'express';
import { SyncSavedUserPostDto } from './user.dtos';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {

  }

  @Post("avatar")
  @UseInterceptors(FileInterceptor('file',{limits:{files:1},}))
  @UseGuards(AuthGuard)
  async uploadAvatar(
    @Req() req,
    @Res() res: Response,
    @UploadedFile() file:Express.Multer.File
  ) {
    return await this.userService.uploadAvatar(req.user, res,file);
  }
  

  @UseGuards(AuthGuard)
    @Post('sync/savedUser')
    async syncSavedUserPost(@Req() req, @Res() res: Response, 
  @Body() syncSavedUserPostDto:SyncSavedUserPostDto) {
    await this.userService.syncSavedUserPost(req.user, res,syncSavedUserPostDto);
    }
    
    @UseGuards(AuthGuard)
    @Get('sync/savedUser')
    async syncSavedUserGet(@Req() req, @Res() res: Response) {
      await this.userService.syncSavedUserGet(req.user, res);
    
    }

  @Get("findOne")
  async findOne(
    @Req() req,
  ) {
    console.log("req")
    return await this.userService.findOne(req?.user);
  }

  @UseGuards(AuthGuard)
  @Get("current")
async getCurrentUser(
  @Req() req,
  @Res() res: Response,
) {
  return await this.userService.getCurrentUser( res,req?.user);
}
}
