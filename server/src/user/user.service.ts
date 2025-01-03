import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/database/entities';
import { AuthUser } from 'src/lib/utils';
import { EntityManager } from 'typeorm';
import { SyncSavedUserPostDto } from './user.dtos';

@Injectable()
export class UserService {
  constructor(private readonly entityManager: EntityManager,
    private readonly cloudinaryService:CloudinaryService

  ) {}

  async uploadAvatar(user:AuthUser, res: Response,file:Express.Multer.File) {
    const filename = user.userId
    const folderName = process.env.CLOUDINARY_PROJECT_FOLDER_BASE+"/avatar"
    const _res = await this.cloudinaryService.uploadFile(file,filename,folderName)
    let userExist = await this.entityManager.findOne(User, {
      where:{
        id:user.userId
      }
    })
    if(userExist){
      userExist.avatarUrl = _res.secure_url
     userExist =  await this.entityManager.save(userExist)
    }
    return res.status(200).send(userExist.avatarUrl) 



  }

  async syncSavedUserPost(user: AuthUser, res: Response,syncSavedUserPostDto:SyncSavedUserPostDto) {
    
  }

async syncSavedUserGet(user: AuthUser, res: Response) {
  }
  
  async findOne(cred: { phoneNumber?: string; email?: string; }) {
    const user = await this.entityManager.findOne(User, {
      where: [
        {
          id: cred.phoneNumber,
        },
        {
          email: cred.email,
        },
      ],
      loadEagerRelations: false,
    });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getCurrentUser(res: Response, user: AuthUser) {
    const userExist = await this.entityManager.findOne(User, {
      where: {
        id: user.userId,
      },

      loadRelationIds: false,
    });
    const { password, ...result } = userExist;
    return res.status(200).send(result);
  }
  async findSecureUser(cred: { email?: string; phoneNumber?: string }) {
    const user = await this.entityManager.findOne(User, {
      where: [
        {
          email: cred.email,
        },
        {
          id: cred.phoneNumber,
        },
      ],
      loadEagerRelations: false,
      select: ['id', 'email', 'password'],
    });
    if (!user) {
      console.log("user not found from secure: ",user)
      throw new Error('User not found');
    }
    return user;
  }
}
