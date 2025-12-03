import { Controller, Get, Post, Put, Delete, Body, Param, Headers, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { ProjectService } from '../services/project.service';

@Controller('projects')
export class ProjectController {
  private readonly logger = new Logger(ProjectController.name);

  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Headers('x-user-id') userId: string, @Body() createProjectDto: CreateProjectDto) {
    console.log('--- STEP 1 REACHED: Project Controller Create ---');
    this.logger.log(`POST /projects called. User ID from header: ${userId || 'MISSING'}`);
    
    if (!userId) {
      this.logger.error('User ID header is missing. User may not be logged in.');
      throw new HttpException(
        'Authentication required. Please log in first.',
        HttpStatus.UNAUTHORIZED
      );
    }
    
    return this.projectService.create(createProjectDto.name, createProjectDto.systemPrompt, userId);
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string) {
    return this.projectService.findAll(userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto.name, updateProjectDto.systemPrompt);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
