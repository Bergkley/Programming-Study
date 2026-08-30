export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUser = Pick<User, "name" | "email"> & {
  password: string;
};

export type LoginUser = Pick<User, "email"> & {
  password: string;
};

export type FindUser = Pick<User, "email">;
export type FindByIdUser = Pick<User, "id">;
