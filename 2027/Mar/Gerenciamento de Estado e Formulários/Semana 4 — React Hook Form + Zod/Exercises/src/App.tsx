import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { StepIndicator } from './components/StepIndicator';
import { PersonalStep } from './components/PersonalStep';
import { AddressStep } from './components/AddressStep';
import { AccountStep } from './components/AccountStep';
import { ReviewStep } from './components/ReviewStep';

import { initialFormData, type Step } from './types/form';
import './index.css';

const steps = ['Pessoal', 'Endereço', 'Conta', 'Revisão'] as const;

const step0Schema = z.object({
  fullName: z.string().trim().min(1, 'Informe seu nome completo.'),
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .email('Informe um e-mail válido.'),
  phone: z.string().trim().min(1, 'Informe seu telefone.'),
});

const step1Schema = z.object({
  zipCode: z.string().trim().min(1, 'Informe seu CEP.'),
  street: z.string().trim().min(1, 'Informe sua rua.'),
  number: z.string().trim().min(1, 'Informe o número do endereço.'),
  city: z.string().trim().min(1, 'Informe sua cidade.'),
  state: z.string().trim().min(1, 'Informe seu estado.'),
});

const step2Schema = z
  .object({
    username: z.string().trim().min(1, 'Informe um nome de usuário.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export const completeFormSchema = step0Schema
  .extend({
    ...step1Schema.shape,
    ...step2Schema.shape,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type FormDataInput = z.infer<typeof completeFormSchema>;

const fieldsByStep: Record<0 | 1 | 2, FieldPath<FormDataInput>[]> = {
  0: ['fullName', 'email', 'phone'],
  1: ['zipCode', 'street', 'number', 'city', 'state'],
  2: ['username', 'password', 'confirmPassword'],
};

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormDataInput>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: initialFormData,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  });

  async function handleNext() {
    if (currentStep >= 3) return;

    const fieldsToValidate = fieldsByStep[currentStep];

    const isStepValid = await trigger(fieldsToValidate, {
      shouldFocus: true,
    });

    if (isStepValid) {
      setCurrentStep((previous) => Math.min(previous + 1, 3) as Step);
    }
  }

  function handleBack() {
    setCurrentStep((previous) => Math.max(previous - 1, 0) as Step);
  }

  function onSubmitFinal(data: FormDataInput) {
    const { confirmPassword, password, ...safeData } = data;

    console.log('Dados do cadastro:', safeData);

    void password;
    void confirmPassword;

    setSubmitted(true);
  }

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  if (submitted) {
    return (
      <main className="page-container">
        <div className="wizard-card success-card">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>

          <h1>Cadastro finalizado!</h1>
          <p>O fluxo do formulário foi concluído com sucesso.</p>

          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              reset(initialFormData);
              setCurrentStep(0);
              setSubmitted(false);
            }}
          >
            Novo cadastro
          </button>
        </div>
      </main>
    );
  }

  const currentFormData = getValues();

  return (
    <main className="page-container">
      <div className="wizard-card">
        <header className="wizard-header">
          <span className="eyebrow">NOVO CADASTRO</span>
          <h1>Crie sua conta</h1>
          <p>Preencha as etapas abaixo para concluir seu cadastro.</p>
        </header>

        <StepIndicator currentStep={currentStep} steps={[...steps]} />

        <form
          noValidate
          onSubmit={
            currentStep === 3
              ? handleSubmit(onSubmitFinal)
              : (event) => event.preventDefault()
          }
        >
          {currentStep === 0 && <PersonalStep register={register} />}

          {currentStep === 1 && <AddressStep register={register} />}

          {currentStep === 2 && <AccountStep register={register} />}

          {currentStep === 3 && <ReviewStep data={currentFormData} />}

          {errorMessages.length > 0 && currentStep < 3 && (
            <div className="error-box" role="alert">
              <strong>Verifique os seguintes campos:</strong>

              <ul>
                {errorMessages.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <footer className="wizard-footer">
            <span className="step-counter">
              Etapa {currentStep + 1} de {steps.length}
            </span>

            <div className="button-group">
              {currentStep > 0 && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={handleBack}
                >
                  Voltar
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleNext}
                >
                  Continuar
                </button>
              ) : (
                <button type="submit" className="button button-primary">
                  Finalizar cadastro
                </button>
              )}
            </div>
          </footer>
        </form>
      </div>
    </main>
  );
}

export default App;
