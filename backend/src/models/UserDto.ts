import { User } from '@prisma/client';

// DTO for user registration, picking necessary fields from the User model
export type UserRegisterDto = Pick<User, 'email' | 'name'> & {
  password: User['pwdHash'];
};

// DTO for user login
export type UserLoginDto = Pick<User, 'email'> & {
  password: User['pwdHash'];
};