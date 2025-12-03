import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProjectModule } from './modules/project/project.module';
import { LlmModule } from './modules/llm/llm.module';
import { User } from './modules/user/domain/user.entity';
import { Project } from './modules/project/domain/project.entity';
import { Chat } from './modules/chat/domain/chat.entity';
import { Message } from './modules/chat/domain/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5435', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'chatbot_db',
      entities: [User, Project, Chat, Message],
      synchronize: true, // Auto-create tables (dev only)
    }),
    AuthModule,
    UserModule,
    ChatModule,
    ProjectModule,
    LlmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
