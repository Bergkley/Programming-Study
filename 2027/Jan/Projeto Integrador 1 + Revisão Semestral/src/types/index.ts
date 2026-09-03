export type AuthenticatedUser = {
  id: number;
  email: string;
  name: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUser = Pick<User, "name" | "email">;
export type FindUserById = Pick<User, "id">;


export type ResponseToken = {
  access_token?: string;
  error?: string;
  error_description?: string;
};
