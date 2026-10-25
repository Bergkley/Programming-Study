import { z } from 'zod';

const stepOne = z.object({
  fullName: z.string().trim().min(1, 'Informe seu nome completo.'),
  email: z.string().trim().email().min(1, 'Informe seu email.'),
  phone: z.string().trim().min(1, 'Informe seu telefone.'),
});

const stepTwo = z.object({
  zipCode: z.string().trim().min(1, 'Informe seu CEP.'),
  street: z.string().trim().min(1, 'Informe sua rua.'),
  number: z.string().trim().min(1, 'Informe o número do endereço.'),
  city: z.string().trim().min(1, 'Informe sua cidade.'),
  state: z.string().trim().min(1, 'Informe seu estado.'),
});

const stepTree = z
  .object({
    username: z.string().trim().min(1, 'Informe um nome de usuário.'),
    password: z
      .string()
      .trim()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

const createAccount = stepOne
  .extend({
    ...stepTwo.shape,
    ...stepTree.shape,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type FormDataInput = z.infer<typeof createAccount>;

export { stepOne, stepTwo, stepTree, createAccount };
export type { FormDataInput };
