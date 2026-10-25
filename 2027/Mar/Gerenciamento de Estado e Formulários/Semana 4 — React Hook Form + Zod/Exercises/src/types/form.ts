export interface FormData {
  fullName: string;
  email: string;
  phone: string;

  zipCode: string;
  street: string;
  number: string;
  city: string;
  state: string;

  username: string;
  password: string;
  confirmPassword: string;
}

export type Step = 0 | 1 | 2 | 3;

export const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',

  zipCode: '',
  street: '',
  number: '',
  city: '',
  state: '',

  username: '',
  password: '',
  confirmPassword: '',
};
