import type { UseFormRegister } from 'react-hook-form';
import type { FormDataInput } from '../App';

interface PersonalStepProps {
  register: UseFormRegister<FormDataInput>;
}

export function PersonalStep({ register }: PersonalStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <h2>Dados pessoais</h2>
        <p>Informe seus dados básicos.</p>
      </div>

      <div className="form-group">
        <label htmlFor="fullName">Nome completo</label>
        <input
          id="fullName"
          type="text"
          placeholder="Seu nome completo"
          autoComplete="name"
          {...register('fullName')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          {...register('email')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Telefone</label>
        <input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          autoComplete="tel"
          {...register('phone')}
        />
      </div>
    </div>
  );
}
