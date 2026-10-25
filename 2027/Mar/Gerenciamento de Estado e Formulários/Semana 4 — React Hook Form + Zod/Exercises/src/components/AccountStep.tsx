import type { UseFormRegister } from 'react-hook-form';
import type { FormDataInput } from '../App';

interface AccountStepProps {
  register: UseFormRegister<FormDataInput>;
}

export function AccountStep({ register }: AccountStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <h2>Configurar conta</h2>
        <p>Crie suas credenciais de acesso.</p>
      </div>

      <div className="form-group">
        <label htmlFor="username">Nome de usuário</label>
        <input
          id="username"
          type="text"
          placeholder="Escolha um usuário"
          autoComplete="username"
          {...register('username')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          placeholder="Mínimo de 8 caracteres"
          autoComplete="new-password"
          {...register('password')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Digite a senha novamente"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
      </div>
    </div>
  );
}
