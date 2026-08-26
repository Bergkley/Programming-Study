export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserListItem = Pick<User, "id" | "name" | "email">;

export type GoogleProfile = {
  name: string;
  email: string;
};

export type ResponseToken = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export type AuthGoogleResponse = {
  message: string;
  user: User;
};
