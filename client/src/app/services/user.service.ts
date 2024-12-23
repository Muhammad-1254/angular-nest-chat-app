import { Injectable, signal } from '@angular/core';
import { AuthUser, User } from '../lib/interface/user.interface';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user = signal<AuthUser>({isAuth:false})
  constructor() {
    const userFound = localStorage.getItem('user')
    if(userFound){
      this.user.set({...this.user(),...JSON.parse(userFound)})
    }
  }

  get getUser():AuthUser{
    if(this.user().id){
      return this.user()
    }
    const  user = JSON.parse(localStorage.getItem('user') || '{}')
    return {...this.user(),...user,isAuth:false}

  }
  setUser(user:Partial<AuthUser>){
    this.user.set({...this.user(),...user})
    localStorage.setItem('user',JSON.stringify(this.user()))
  }

}
