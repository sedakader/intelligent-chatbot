import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './domain/chat.entity';
import { Message } from './domain/message.entity';
import { Project } from '../project/domain/project.entity';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Project]),
    LlmModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
