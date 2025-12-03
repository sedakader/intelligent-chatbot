import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './domain/project.entity';
import { ProjectController } from './controllers/project.controller';
import { ProjectService } from './services/project.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [TypeOrmModule, ProjectService],
})
export class ProjectModule {}
