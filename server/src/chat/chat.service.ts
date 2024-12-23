import { EntityManager, In, Raw } from 'typeorm';
import {
  AddMembersToGroupDto,
  CreateChatDto,
  CreateGroupDto,
  RemoveAdminOfGroupDto,
  RemoveMembersFromGroupDto,
  UpdatedGroupBasicInfoDto,
  UploadFileDto,
} from './chat.dtos';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from 'src/lib/utils';
import { UserService } from 'src/user/user.service';
import {
  Chat,
  Group,
  Message,
  User,
  UserChatAssociation,
  UserGroupAssociation,
} from 'src/database/entities';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { compressBufferToZip } from 'src/lib/utils-functions';

@Injectable()
export class ChatService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createChatDto(
    user: AuthUser,
    res: Response,
    createChatDto: CreateChatDto,
  ) {
    if (!createChatDto.email && !createChatDto.phoneNumber) {
      throw new BadRequestException('Invalid email or phone number');
    }
    const friendExist = await this.userService.findOne({
      phoneNumber: createChatDto.phoneNumber,
      email: createChatDto.email,
    });
    if (!friendExist) {
      return res.status(404).send({ message: 'User not found' });
    }
    // now find chat between user and friend
    const userChat = await this.entityManager.find(UserChatAssociation, {
      where: [
        {
          userId: user.userId,
        },
      ],
    });
    const friendChat = await this.entityManager.find(UserChatAssociation, {
      where: [
        {
          userId: friendExist.id,
        },
      ],
    });
    for (const uChat of userChat) {
      for (const fChat of friendChat) {
        if (uChat.chatId === fChat.chatId) {
          const chat = await this.entityManager.findOne(Chat, {
            where: {
              id: uChat.chatId,
            },
          });
          return res.status(200).send({ chat, message: 'Chat already exists' });
        }
      }
    }
    // create new chat
    const newChat = new Chat({});
    let chat = await this.entityManager.save(newChat);

    const userChatAssociation = new UserChatAssociation({
      userId: user.userId,
      chatId: chat.id,
    });
    const friendChatAssociation = new UserChatAssociation({
      userId: friendExist.id,
      chatId: chat.id,
    });
    await this.entityManager.transaction(async (em) => {
      await em.save(userChatAssociation);
      await em.save(friendChatAssociation);
    });

    return res.status(201).send({ chat, message: 'Chat created successfully' });
  }

  async createGroupChatDto(
    user: AuthUser,
    res: Response,
    createGroupDto: CreateGroupDto,
  ) {
    let group: Group;
    await this.entityManager.transaction(async (em) => {
      const newGroup = new Group({
        name: createGroupDto.name,
        description: createGroupDto.description,
        groupAdmins: [user.userId],
      });
      group = await em.save(newGroup);
      // now add admin to the group
      const userGroupAssociation = new UserGroupAssociation({
        userId: user.userId,
        groupId: group.id,
      });
      await em.save(userGroupAssociation);
    });

    try {
      const { status } = await this.addMembersToGroup(user, {
        groupId: group.id,
        members: createGroupDto.members,
      });
      console.log('status: ', status);
      return res.status(status).send({ message: 'Group created successfully' });
    } catch (error) {
      console.log('error from createGroupChatDto: ', error);
      throw new Error(error);
    }
  }

  async addMembersToGroup(
    adminUser: AuthUser,
    addMembersToGroupDto: AddMembersToGroupDto,
  ) {
    // check if user is admin of group
    const validAdmin = await this.entityManager.findOne(Group, {
      where: {
        id: addMembersToGroupDto.groupId,
        groupAdmins: Raw((alias) => `${alias} @> ARRAY[:value]`, {
          value: adminUser.userId,
        }),
      },
    });
    if (!validAdmin) {
      throw new HttpException('You are not an admin of this group', 401);
    }
    // check if members exist
    const validMembers = await this.entityManager.find(User, {
      where: {
        id: In(addMembersToGroupDto.members),
      },
    });
    // add members to group
    await this.entityManager.transaction(async (em) => {
      for (const member of validMembers) {
        // check if member is already in group
        const userGroupAssociationExist = await em.findOne(
          UserGroupAssociation,
          {
            where: {
              userId: member.id,
              groupId: addMembersToGroupDto.groupId,
            },
          },
        );
        if (userGroupAssociationExist) continue;

        const userGroupAssociation = new UserGroupAssociation({
          userId: member.id,
          groupId: addMembersToGroupDto.groupId,
        });
        await em.save(userGroupAssociation);
      }
    });
    return {
      status: 201,
      message: 'Members added successfully',
    };
  }
  async removeAdminOfGroup(
    user: AuthUser,
    res: Response,
    removeAdminOfGroupDto: RemoveAdminOfGroupDto,
  ) {
    // check if user is admin of group
    const validAdmin = await this.entityManager.findOne(Group, {
      where: {
        id: removeAdminOfGroupDto.groupId,
        groupAdmins: Raw((alias) => `${alias} @> ARRAY[:value]`, {
          value: user.userId,
        }),
      },
    });
    if (!validAdmin) {
      throw new HttpException('You are not an admin of this group', 401);
    }
    // now remove adminId from groupAdmins
    validAdmin.groupAdmins = validAdmin.groupAdmins.filter(
      (adminId) => adminId !== removeAdminOfGroupDto.adminId,
    );
    await this.entityManager.save(validAdmin);

    return res.status(200).send({ message: 'Admin removed successfully' });
  }
  async removeMembersFromGroup(
    user: AuthUser,
    res: Response,
    removeMembersFromGroupDto: RemoveMembersFromGroupDto,
  ) {
    // check if user is admin of group
    const validAdmin = await this.entityManager.findOne(Group, {
      where: {
        id: removeMembersFromGroupDto.groupId,
        groupAdmins: Raw((alias) => `${alias} @> ARRAY[:value]`, {
          value: user.userId,
        }),
      },
    });
    if (!validAdmin) {
      throw new HttpException('You are not an admin of this group', 401);
    }
    // check if members exist
    const validMembers = await this.entityManager.find(User, {
      where: {
        id: In(removeMembersFromGroupDto.members),
      },
    });
    // remove members from group
    await this.entityManager.transaction(async (em) => {
      for (const member of validMembers) {
        // check if member is already in group
        const userGroupAssociationExist = await em.findOne(
          UserGroupAssociation,
          {
            where: {
              userId: member.id,
              groupId: removeMembersFromGroupDto.groupId,
            },
          },
        );
        if (!userGroupAssociationExist) continue;
        await em.remove(userGroupAssociationExist);
      }
    });
    return res.status(200).send({ message: 'Members removed successfully' });
  }
  async updatedGroupBasicInfo(
    user: AuthUser,
    res: Response,
    updatedGroupBasicInfoDto: UpdatedGroupBasicInfoDto,
  ) {
    // check if user is admin of group
    const validAdmin = await this.entityManager.findOne(Group, {
      where: {
        id: updatedGroupBasicInfoDto.groupId,
        groupAdmins: Raw((alias) => `${alias} @> ARRAY[:value]`, {
          value: user.userId,
        }),
      },
    });
    if (!validAdmin) {
      throw new HttpException('You are not an admin of this group', 401);
    }
    // update group info
    if (updatedGroupBasicInfoDto.name)
      validAdmin.name = updatedGroupBasicInfoDto.name;
    if (updatedGroupBasicInfoDto.description)
      validAdmin.description = updatedGroupBasicInfoDto.description;
    if (updatedGroupBasicInfoDto.avatarUrl)
      validAdmin.avatarUrl = updatedGroupBasicInfoDto.avatarUrl;
    await this.entityManager.save(validAdmin);
    return res.status(200).send({ message: 'Group info updated successfully' });
  }

  async getMembersOfGroup(groupId: number) {
    return await this.entityManager.find(UserGroupAssociation, {
      where: {
        groupId,
      },
    });
  }

  async _syncData(user: AuthUser) {
    const { email, userId } = user;
    const userGroupAssociation = await this.entityManager.find(
      UserGroupAssociation,
      {
        where: {
          userId,
        },
        relations: ['user'],
      },
    );
    const groups: Group[] = [];
    for (const group of userGroupAssociation) {
      const groupData = await this.entityManager.findOne(Group, {
        where: {
          id: group.groupId,
        },
        relations: ['messages', 'users'],
      });

      groups.push(groupData);
    }
    const userChatAssociation = await this.entityManager.find(
      UserChatAssociation,
      {
        where: {
          userId,
        },
      },
    );
    const chats: Chat[] = [];
    for (const chat of userChatAssociation) {
      const chatData = await this.entityManager.findOne(Chat, {
        where: {
          id: chat.chatId,
        },
        relations: ['messages', 'users'],
      });

      chats.push(chatData);
    }

    const users = await this.entityManager.find(User);

    // load complete users
    const tempChats = [];
    const tempGroups = [];
    let realUsers = [];
    for (const chat of chats) {
      for (const user of chat.users) {
        const realUser = users.find((u) => u.id === user.userId);
        if (realUser) realUsers.push(realUser);
      }
      tempChats.push({ ...chat, users: realUsers });
      realUsers = [];
    }
    realUsers = [];
    for (const group of groups) {
      for (const user of group.users) {
        const realUser = users.find((u) => u.id === user.userId);
        if (realUser) realUsers.push(realUser);
      }
      tempGroups.push({ ...group, users: realUsers });
      realUsers = [];
    }

    return { groups: tempGroups, chats: tempChats, users };
  }

  async _messageSend(message: Message) {
    return await this.entityManager.save(message);
  }

  async _messageDelivered(messageId: number) {
    const message = await this.entityManager.findOne(Message, {
      where: {
        id: messageId,
      },
    });
    if (message) {
      message.deliveredAt = new Date();
      return await this.entityManager.save(message);
    }
  }
  async _messageSeen(messageId: number) {
    const message = await this.entityManager.findOne(Message, {
      where: {
        id: messageId,
      },
    });
    if (message) {
      message.seenAt = new Date();
      return await this.entityManager.save(message);
    }
  }
  async getUserSocket(userId: string): Promise<string | undefined> {
    return await this.cacheManager.get(userId);
  }
  async setUserSocket(userId: string, socketId: string) {
    await this.cacheManager.set(userId, socketId);
    console.log('user socket set', await this.getUserSocket(userId));
  }
  async removeUserSocket(userId: string) {
    await this.cacheManager.del(userId);
  }

  // async _uploadFilesHandler(user: AuthUser, uploadFileDto: UploadFileDto) {
  //   const chat = await this.entityManager.findOne(
  //     uploadFileDto.type === 'chat' ? Chat : Group,
  //     {
  //       where: {
  //         id: uploadFileDto.typeId,
  //       },
  //     },
  //   );
  //   if (!chat) {
  //     return { status: 404, message: 'Chat not found' };
  //   }

  //   let filename = uploadFileDto.type + '/' + chat.id + '/' + user.userId;
  //   filename = filename+'-_-'+uploadFileDto.filename + '-_-' + Date.now();
  //   let buffer = Buffer.from(uploadFileDto.file);
  //   //TODO: check if file type other than image, video, audio and pdf than compress it
  //   const { secure_url } = await this.cloudinaryService.uploadBuffer(
  //     buffer,
  //     filename,
  //   );
  //   const messageNew = new Message({
  //     chatId: uploadFileDto.type === 'chat' ? chat.id : null,
  //     groupId: uploadFileDto.type === 'group' ? chat.id : null,
  //     messageType: uploadFileDto.type,
  //     userId: user.userId,
  //     textContent: null,
  //     mediaContent: secure_url,
  //     mediaType: uploadFileDto.mimeType,
  //     sentAt: new Date(),
  //   });
  //   const message = await this.entityManager.save(messageNew);
  //   return { status: 201, message };
  // }
}
