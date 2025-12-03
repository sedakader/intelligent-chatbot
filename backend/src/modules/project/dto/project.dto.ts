export class CreateProjectDto {
  name: string;
  systemPrompt: string;
}

export class UpdateProjectDto {
  name?: string;
  systemPrompt?: string;
}
