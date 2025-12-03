import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateChatDto, RenameChatDto, SendMessageDto, StartChatDto } from '../dto/chat.dto';
import { ChatService } from '../services/chat.service';

@Controller('chats')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  async start(@Headers('x-user-id') userId: string, @Body() startChatDto: StartChatDto) {
    console.log('--- STEP 1 REACHED: Controller Start ---');
    this.logger.log(`POST /chats/start called. User ID from header: ${userId || 'MISSING'}`);
    
    if (!userId) {
      this.logger.error('User ID header is missing. User may not be logged in.');
      throw new HttpException(
        'Authentication required. Please log in first.',
        HttpStatus.UNAUTHORIZED
      );
    }
    
    try {
      return await this.chatService.startChat(userId, startChatDto.content, startChatDto.projectId);
    } catch (error) {
      this.logger.error(`Error in start chat: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post()
  async create(@Headers('x-user-id') userId: string, @Body() createChatDto: CreateChatDto) {
    this.logger.log(`POST /chats called for user: ${userId}`);
    return this.chatService.createChat(userId, createChatDto.name);
  }

  @Get()
  async findAll(@Headers('x-user-id') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Patch(':id/rename')
  rename(@Param('id') id: string, @Body() renameChatDto: RenameChatDto) {
    return { id, ...renameChatDto };
  }

  @Delete('history')
  async clearHistory(@Headers('x-user-id') userId: string) {
    await this.chatService.clearAllChats(userId);
    return { success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return { success: true };
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.chatService.getChatMessages(id);
  }

  @Post('messages')
  async sendMessage(@Headers('x-user-id') userId: string, @Body() sendMessageDto: SendMessageDto) {
    const response = await this.chatService.sendMessage(userId, sendMessageDto.chatId, sendMessageDto.content);
    return { response };
  }
}
