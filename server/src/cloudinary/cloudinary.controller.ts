import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { UploadMediaMessageDto } from './cloudinary.dtos';


// @ApiTags    ('Cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}


  @UseGuards(AuthGuard)
  @Get('presigned-url')
   getPresignedUrl(
    @Req() req,
    @Res() res: Response,
    @Query('filename') filename: string,
    @Query('type') type: 'chat' | 'group',
    @Query('typeId') typeId: number,
    @Query('mimeType') mimeType: string,
  ) {
   return  this.cloudinaryService.getPresignedUrl(req?.user, res,{filename, type, typeId, mimeType});
  }

  @UseGuards(AuthGuard)
  @Post('media/message')
  async uploadMediaMessage(@Req() req, @Res() res: Response,
  @Body() uploadMediaMessageDto:UploadMediaMessageDto
) {
  return await this.cloudinaryService.uploadMediaMessage(req.user, res, uploadMediaMessageDto);
    
  }

  
}
