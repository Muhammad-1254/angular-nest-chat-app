export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatarUrl: string | null;
  publicKey: string;

  createdAt: Date;
  updatedAt: Date;
}


export interface AuthUser extends Partial<User> {
  isAuth: boolean;
}
