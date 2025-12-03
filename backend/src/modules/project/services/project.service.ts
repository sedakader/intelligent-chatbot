import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../domain/project.entity';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(name: string, systemPrompt: string, userId: string): Promise<Project> {
    this.logger.log(`Creating project '${name}' for user ${userId}`);
    console.log('--- STEP 1 REACHED: Project Service Create ---');
    try {
      const project = this.projectRepository.create({
        name,
        systemPrompt,
        user: { id: userId } as any,
      });
      console.log('--- STEP 2 REACHED: Project Created in Memory ---');
      const savedProject = await this.projectRepository.save(project);
      console.log('--- STEP 3 REACHED: Project Saved to DB ---');
      return savedProject;
    } catch (error) {
      this.logger.error('Error creating project:', error.stack);
      console.log('--- STEP ERROR REACHED: Project Creation Failed ---');
      throw error;
    }
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['chats'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['chats'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, name?: string, systemPrompt?: string): Promise<Project> {
    const project = await this.findOne(id);
    if (name) project.name = name;
    if (systemPrompt) project.systemPrompt = systemPrompt;
    return this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
