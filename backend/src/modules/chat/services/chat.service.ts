import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Chat } from '../../chat/domain/chat.entity';
import { Message, MessageRole } from '../../chat/domain/message.entity';
import { Project } from '../../project/domain/project.entity';
import { LlmService } from '../../llm/services/llm.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private llmService: LlmService,
    private dataSource: DataSource,
  ) {}

  async startChat(userId: string, content: string, projectId?: string): Promise<{ chat: Chat; response: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    this.logger.log(`Starting chat for user ${userId}`);
    console.log('--- STEP 2 REACHED: Service Start Transaction ---');

    try {
      // 1. Create Chat Entity
      console.log('--- STEP 3 REACHED: Create Chat Entity ---');
      const chat = queryRunner.manager.create(Chat, {
        name: this.generateChatTitle(content),
        user: { id: userId } as any,
      });

      if (projectId) {
        const project = await queryRunner.manager.findOne(Project, { where: { id: projectId } });
        if (project) {
          chat.project = project;
        }
      }

      const savedChat = await queryRunner.manager.save(chat);
      this.logger.debug(`Chat saved with ID: ${savedChat.id}`);

      // 2. Save User Message
      console.log('--- STEP 4 REACHED: Save User Message ---');
      await queryRunner.manager.save(Message, {
        chat: savedChat,
        role: MessageRole.USER,
        content,
      });

      // 3. Generate AI Response
      console.log('--- STEP 5 REACHED: Call LLM Service ---');
      const systemPrompt = await this.determineSystemPrompt(savedChat);
      let aiResponse: string;
      try {
        aiResponse = await this.llmService.generateResponse(content, systemPrompt, []);
      } catch (error) {
        this.logger.error(`LLM Service Failed: ${error.message}`);
        throw new Error(`LLM Generation Failed: ${error.message}`);
      }
      console.log('--- STEP 6 REACHED: LLM Success ---');

      // 4. Save AI Message
      console.log('--- STEP 7 REACHED: Save AI Message ---');
      await queryRunner.manager.save(Message, {
        chat: savedChat,
        role: MessageRole.ASSISTANT,
        content: aiResponse,
      });

      await queryRunner.commitTransaction();
      console.log('--- STEP 8 REACHED: Transaction Committed ---');

      return { chat: savedChat, response: aiResponse };
    } catch (err) {
      console.log('--- STEP ERROR REACHED: Rolling Back ---');
      this.logger.error(`Transaction failed: ${err.message}`, err.stack);
      await queryRunner.rollbackTransaction();
      throw err; // Re-throw to be caught by controller
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['messages', 'project'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async createChat(userId: string, name?: string): Promise<Chat> {
    const chat = this.chatRepository.create({
      name: name || 'New Chat',
      user: { id: userId } as any,
    });
    return this.chatRepository.save(chat);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    // Assuming userId is available in Chat entity or we filter by user relation
    // For now, returning all chats as per previous implementation, but ideally should filter
    return this.chatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['project'],
    });
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(userId: string, chatId: string, content: string): Promise<string> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['project'],
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Fetch recent history
    const history = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      take: 10,
      order: { createdAt: 'DESC' },
    });

    const formattedHistory = history.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const systemPrompt = await this.determineSystemPrompt(chat);
    const aiResponse = await this.llmService.generateResponse(content, systemPrompt, formattedHistory);

    await this.messageRepository.save({
      chat,
      role: MessageRole.USER,
      content,
    });

    await this.messageRepository.save({
      chat,
      role: MessageRole.ASSISTANT,
      content: aiResponse,
    });

    return aiResponse;
  }

  private generateChatTitle(content: string): string {
    return content.split(' ').slice(0, 3).join(' ') || 'New Chat';
  }

  private async determineSystemPrompt(chat: Chat): Promise<string> {
    let systemPrompt = 'You are a helpful assistant';
    if (chat.project) {
      // Ensure we have the project loaded. If not loaded in chat, we might need to fetch it.
      // But we used relations: ['project'] in findOne, so it should be there if it exists.
      // If it was just created in startChat, it is also there.
      if (chat.project.systemPrompt) {
         systemPrompt = `You are a helpful assistant. ${chat.project.systemPrompt}`;
      }
    }
    return systemPrompt;
  }

  async clearAllChats(userId: string): Promise<void> {
    const chats = await this.chatRepository.find({ where: { user: { id: userId } } as any });
    if (chats.length > 0) {
      await this.chatRepository.remove(chats);
    }
  }
}
