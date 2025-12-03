import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { Chat } from '../../chat/domain/chat.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  systemPrompt: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @OneToMany(() => Chat, (chat) => chat.project)
  chats: Chat[];
}
