import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuth = signal<boolean>(localStorage.getItem('isAuth') === 'true');

  getIsAuth() {
    return this.isAuth();
  }
  setIsAuth(isAuth: boolean) {
    this.isAuth.set(isAuth);
    localStorage.setItem('isAuth', String(this.isAuth()));
  }
}
