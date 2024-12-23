import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const streamifier = require('streamifier');

// cloudinary-response.ts
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { GetPresignedUrlDto, UploadMediaMessageDto } from './cloudinary.dtos';
import { AuthUser } from 'src/lib/utils';
import { Response } from 'express';
import { Message } from 'src/database/entities';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  constructor(private readonly entityManager: EntityManager) {}
  uploadFile(
    files: Express.Multer.File,
    filename: string,
    folderName: string = process.env.CLOUDINARY_PROJECT_FOLDER_BASE,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          filename_override: filename,
          public_id: filename,
          access_mode: 'public',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(files.buffer).pipe(uploadStream);
    });
  }
  uploadBuffer(
    buffer: Buffer,
    filename: string,
    folderName: string = process.env.CLOUDINARY_PROJECT_FOLDER_BASE,
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          filename_override: filename,
          public_id: filename,
          access_mode: 'public',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  getPresignedUrl(
    user: AuthUser,
    res: Response,
    { filename, mimeType, type, typeId }: GetPresignedUrlDto,
  ) {
    try {
      const publicId = `${user?.userId}${'-_-' + filename + '-_-' + Date.now()}`;
      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        public_id: publicId,
        folder: `angular-nest-chat-app/${type}/${typeId}`,
        timestamp,
      };

      const signature = cloudinary.utils.api_sign_request(
        params,
        cloudinary.config().api_secret,
      );

      const url = `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/auto/upload`;

      return res.send({
        url,
        params: {
          ...params,
          api_key: cloudinary.config().api_key,
          signature,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async uploadMediaMessage(
    user: AuthUser,
    res: Response,
    data: UploadMediaMessageDto,
  ) {
    const messageNew = new Message({
      mediaContent: data.url,
      messageType: data.type,
      chatId: data.type==='chat'? data?.typeId : null,
      groupId: data.type==='group'? data?.typeId : null,
      mediaType: data.mimeType,
      sentAt: new Date(),
      userId: user.userId,
    });
    try {
      const message = await this.entityManager.save(messageNew);
      return res.status(201).send(message);
    } catch (error) {
      return res.send(500).send({ message: "Something wen't wrong" ,error});
    }
  }
}
