export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type GoogleProfile = {
  sub: string;
  name: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
};
