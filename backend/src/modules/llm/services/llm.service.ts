import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

@Injectable()
export class LlmService {
  private chatModel: ChatOpenAI;

  constructor() {
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4', // Configurable
    });
  }

  async generateResponse(
    userMessage: string,
    systemPrompt: string = 'You are a helpful assistant.',
    history: { role: string; content: string }[] = []
  ): Promise<string> {
    
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
      }

      const messages: BaseMessage[] = [
        new SystemMessage(systemPrompt),
        ...history.map(msg => 
          msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content)
        ),
        new HumanMessage(userMessage),
      ];

      const response = await this.chatModel.invoke(messages);
      return response.content as string;
    } catch (error) {
      console.error('LLM Invoke Error:', error);
      throw new Error(`Failed to generate response from LLM: ${error.message}`);
    }
  }
}
