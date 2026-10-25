import { useState } from 'react';

import { StepIndicator } from './components/StepIndicator';
import { PersonalStep } from './components/PersonalStep';
import { AddressStep } from './components/AddressStep';
import { AccountStep } from './components/AccountStep';
import { ReviewStep } from './components/ReviewStep';

import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { initialFormData, type FormData, type Step } from './types/form';

import './index.css';
import { createAccount, type FormDataInput } from './validation/validationForm';

const steps = ['Pessoal', 'Endereço', 'Conta', 'Revisão'];

const fieldsByStep: Record<0 | 1 | 2, FieldPath<FormDataInput>[]> = {
  0: ['fullName', 'email', 'phone'],
  1: ['zipCode', 'street', 'number', 'city', 'state'],
  2: ['username', 'password', 'confirmPassword'],
};

function App() {
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormDataInput>({
    resolver: zodResolver(createAccount),
    defaultValues: initialFormData,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldUnregister: false,
  });
  const [currentStep, setCurrentStep] = useState<Step>(0);

  const [submitted, setSubmitted] = useState(false);

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

  function onSubmit() {
    const { password, confirmPassword, ...safeData } = formData;

    console.log('Dados para envio:', {
      ...safeData,
      password,
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="page-container">
        <div className="wizard-card success-card">
          <div className="success-icon">✓</div>

          <h1>Cadastro finalizado!</h1>

          <p>O fluxo do formulário foi concluído com sucesso.</p>

          <button
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

  const errorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

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
          onSubmit={
            currentStep === 3
              ? handleSubmit(onSubmit)
              : (event) => event.preventDefault()
          }
        >
          {currentStep === 0 && <PersonalStep register={register} />}

          {currentStep === 1 && <AddressStep register={register} />}

          {currentStep === 2 && <AccountStep register={register} />}

          {currentStep === 3 && <ReviewStep data={currentFormData} />}

          {errorMessages.length > 0 && (
            <div className="error-box" role="alert">
              <strong>Verifique os seguintes campos:</strong>

              <ul>
                {errorMessages.map((error) => (
                  <li key={error}>{error}</li>
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

              {currentStep >= 3 ? (
                <button type="submit" className="button button-primary">
                  Finalizar cadastro
                </button>
              ) : (
                <button
                  className="button button-primary"
                  onClick={handleNext}
                  type="button"
                >
                  Continuar
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
