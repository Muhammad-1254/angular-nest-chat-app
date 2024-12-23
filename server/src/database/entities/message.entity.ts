import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from './user.entity';
import { Group } from './group.entity';
import { ParentEntity } from './parentEntity';

@Entity('messages')
export class Message extends ParentEntity<Message> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'text', nullable: true })
  mediaContent: string; // URL

  @Column({ type: 'text', nullable: true })
  mediaType: string;

  @Column({ type: 'enum', enum: ['chat', 'group'] })
  messageType: 'chat' | 'group';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date; 

  @Column({ type: 'timestamp', nullable: true })
  seenAt: Date;

  @Column({ type: 'varchar', length: 15 })
  userId: string;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: true })
  groupId: number;
  

  @ManyToOne(() => Group, (group) => group.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'int', nullable: true })
  chatId: number;
  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;
}
