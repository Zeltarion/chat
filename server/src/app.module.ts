import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';

@Module({
  imports: [ChatModule],
  controllers: [AppController],
})
export class AppModule {}
