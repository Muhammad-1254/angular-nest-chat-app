import { Column, Entity,  OneToMany,  PrimaryGeneratedColumn } from 'typeorm';
import { UserGroupAssociation } from './user-group-association.entity';
import { Message } from './message.entity';
import { ParentEntity } from "./parentEntity";

@Entity('groups')
export class Group  extends ParentEntity<Group>{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', array: true, nullable:false })
  groupAdmins: string[];

  @OneToMany(() => Message, (message) => message.group,{cascade:true})
  messages: Message[];

  @OneToMany(
    () => UserGroupAssociation,
    (userGroupsAssociation) => userGroupsAssociation.group,
    {cascade:true}
  )
  users: UserGroupAssociation[];
}
