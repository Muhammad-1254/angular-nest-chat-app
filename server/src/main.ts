import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { setupSwagger } from './lib/swagger';
import * as cookieParser from 'cookie-parser';

import { WebsocketAdapter } from './adapters/websocket.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
const configService = app.get(ConfigService);
  app.enableCors({
    origin:configService.get('FRONTEND_URL'),
    credentials:true
  });
  // app.use(helmet())
  app.use(cookieParser());

  setupSwagger(app);

  app.useWebSocketAdapter(
    new WebsocketAdapter(app, {
      origin: configService.get('FRONTEND_URL'),
      credentials:true
    }),
  );


  await app.listen(process.env.PORT ?? 3000);

  // for HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}
bootstrap();


declare const module:any
