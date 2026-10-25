import type { FormDataInput } from '../App';

interface ReviewStepProps {
  data: FormDataInput;
}

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div className="step-content">
      <div className="step-heading">
        <h2>Revisar cadastro</h2>
        <p>Confira as informações antes de finalizar.</p>
      </div>

      <section className="review-section">
        <h3>Dados pessoais</h3>
        <p>
          <strong>Nome:</strong> {data.fullName}
        </p>
        <p>
          <strong>E-mail:</strong> {data.email}
        </p>
        <p>
          <strong>Telefone:</strong> {data.phone}
        </p>
      </section>

      <section className="review-section">
        <h3>Endereço</h3>
        <p>
          <strong>CEP:</strong> {data.zipCode}
        </p>
        <p>
          <strong>Rua:</strong> {data.street}, {data.number}
        </p>
        <p>
          <strong>Cidade:</strong> {data.city} - {data.state}
        </p>
      </section>

      <section className="review-section">
        <h3>Conta</h3>
        <p>
          <strong>Usuário:</strong> {data.username}
        </p>
        <p>
          <strong>Senha:</strong>{' '}
          {'•'.repeat(Math.min(data.password.length, 12))}
        </p>
      </section>
    </div>
  );
}
