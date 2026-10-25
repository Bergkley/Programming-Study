import type { UseFormRegister } from 'react-hook-form';
import type { FormDataInput } from '../App';

interface AddressStepProps {
  register: UseFormRegister<FormDataInput>;
}

export function AddressStep({ register }: AddressStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <h2>Endereço</h2>
        <p>Informe onde você mora.</p>
      </div>

      <div className="form-group">
        <label htmlFor="zipCode">CEP</label>
        <input
          id="zipCode"
          type="text"
          placeholder="00000-000"
          autoComplete="postal-code"
          {...register('zipCode')}
        />
      </div>

      <div className="form-group">
        <label htmlFor="street">Rua</label>
        <input
          id="street"
          type="text"
          placeholder="Nome da rua"
          autoComplete="address-line1"
          {...register('street')}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="number">Número</label>
          <input id="number" type="text" {...register('number')} />
        </div>

        <div className="form-group">
          <label htmlFor="state">Estado</label>
          <input
            id="state"
            type="text"
            placeholder="CE"
            autoComplete="address-level1"
            {...register('state')}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="city">Cidade</label>
        <input
          id="city"
          type="text"
          placeholder="Sua cidade"
          autoComplete="address-level2"
          {...register('city')}
        />
      </div>
    </div>
  );
}
