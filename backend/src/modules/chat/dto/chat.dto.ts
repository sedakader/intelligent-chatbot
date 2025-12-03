export class CreateChatDto {
  name?: string;
  projectId?: string;
}

export class RenameChatDto {
  name: string;
}

export class SendMessageDto {
  chatId: string;
  content: string;
}

export class StartChatDto {
  content: string;
  projectId?: string;
}
