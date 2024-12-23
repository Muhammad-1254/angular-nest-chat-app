import { Column, Entity, OneToMany } from 'typeorm';
import { UserChatAssociation } from './user-chat-association.entity';
import { UserGroupAssociation } from './user-group-association.entity';
import { Message } from './message.entity';
import { ParentEntity } from './parentEntity';

@Entity('users')
export class User extends ParentEntity<User> {
  @Column({ primary: true, type: 'varchar', length: 15 })
  id: string; // should be phoneNumber
  @Column({ nullable: false, type: 'varchar', length: 50, unique: true })
  email: string;
  @Column({ nullable: false, type: 'varchar', length: 255 })
  password: string;
  @Column({ nullable: false, type: 'varchar', length: 50 })
  firstname: string;
  @Column({ nullable: false, type: 'varchar', length: 50 })
  lastname: string;
  @Column({ nullable: true, type: 'text' })
  avatarUrl: string;

  @Column({ nullable: true, type: 'text' })
  publicKey: string;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(
    () => UserChatAssociation,
    (userChatAssociation) => userChatAssociation.user,
    { cascade: true },
  )
  chats: UserChatAssociation[];

  @OneToMany(
    () => UserGroupAssociation,
    (userGroupsAssociation) => userGroupsAssociation.user,
    {
      cascade: true,
    },
  )
  groups: UserGroupAssociation[];
}
