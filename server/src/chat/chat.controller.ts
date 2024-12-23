import { AddMembersToGroupDto, CreateChatDto, CreateGroupDto, RemoveAdminOfGroupDto, RemoveMembersFromGroupDto, UpdatedGroupBasicInfoDto } from './chat.dtos';
import { ChatService } from './chat.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Chat')
@Controller('')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Get("sync/all")
async syncAllData(
  @Req()
  req,
  @Res()
  res: Response,
){
  const data = await this.chatService._syncData(req?.user)
  return res.status(200).send(data)
}



  @UseGuards(AuthGuard)
  @Post('chat/new')
  async createNewChat(
    @Req()
    req,
    @Res()
    res: Response,
    @Body() createChatDto: CreateChatDto,
  ) {
    console.log('req: ', req?.user);
    await this.chatService.createChatDto(req?.user, res, createChatDto);
  }

  @UseGuards(AuthGuard)
  @Post('group/new')
  async createNewGroup(
    @Req()
    req,
    @Res()
    res: Response,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    console.log('req: ', req?.user);
    await this.chatService.createGroupChatDto(req?.user, res, createGroupDto);
  }

  @UseGuards(AuthGuard)
    @Post("group/add-members")
    async addMembersToGroup(
        @Req()
        req,
        @Res()
        res: Response,
        @Body() addMembersToGroupDto: AddMembersToGroupDto,
    ){
        try {
            const {status, message} = await this.chatService.addMembersToGroup(req?.user,addMembersToGroupDto)
            return res.status(status).send({message})
        } catch (error) {
            throw new HttpException(error?.message, error?.status)
        }

    }

     

    @UseGuards(AuthGuard)
    @Put("group/remove-admin") // remove admin from group
    async removeAdminOfGroup(
        @Req()
        req,
        @Res()
        res: Response,
        @Body() removeAdminOfGroupDto: RemoveAdminOfGroupDto,
    ){
      return await this.chatService.removeAdminOfGroup(req?.user,res, removeAdminOfGroupDto)
    }

    @UseGuards(AuthGuard)
    @Put("group/remove-members")
    async removeMembersFromGroup(
        @Req()
        req,
        @Res()
        res: Response,
        @Body() removeMembersFromGroupDto: RemoveMembersFromGroupDto,
    ){
      return await this.chatService.removeMembersFromGroup(req?.user,res, removeMembersFromGroupDto)
    }

    @UseGuards(AuthGuard)
    @Put("group/basic-info")
    async updatedGroupBasicInfo(
        @Req()
        req,
        @Res()
        res: Response,
        @Body() updatedGroupBasicInfoDto: UpdatedGroupBasicInfoDto,
    ){
      return await this.chatService.updatedGroupBasicInfo(req?.user,res, updatedGroupBasicInfoDto)
    }
    
    
}
