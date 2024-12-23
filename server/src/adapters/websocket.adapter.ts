import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CorsOptions } from 'cors';

export class WebsocketAdapter extends IoAdapter {
  constructor(
    appOrHttpServer: INestApplicationContext,
    private readonly corsOptions: CorsOptions,
  ) {
    super(appOrHttpServer);
  }
  createIOServer(port: number, options?: any) {
    return super.createIOServer(port, {
      cors: this.corsOptions,
      ...options,
    });
  }
}
