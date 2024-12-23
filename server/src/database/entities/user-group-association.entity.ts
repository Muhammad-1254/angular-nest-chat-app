import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";
import { Group } from "./group.entity";
import { ParentEntity } from "./parentEntity";


@Entity('user_group_association')
export class UserGroupAssociation  extends ParentEntity<UserGroupAssociation>{
    
    @PrimaryColumn({type:'varchar', length:15 })
    userId:string

    @PrimaryColumn({type:'int', })
    groupId:number

    @ManyToOne(()=>User,user=>user.groups,{onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'userId'})
    user:User

    @ManyToOne(()=>Group,group=>group.users, {onDelete:'CASCADE',onUpdate:'CASCADE'})
    @JoinColumn({name:'groupId'})
    group:Group
    
 
    
}