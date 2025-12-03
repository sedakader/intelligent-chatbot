import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { Project } from '../../project/domain/project.entity';
import { Message } from './message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.chats)
  user: User;

  @ManyToOne(() => Project, (project) => project.chats, { nullable: true })
  project: Project;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
