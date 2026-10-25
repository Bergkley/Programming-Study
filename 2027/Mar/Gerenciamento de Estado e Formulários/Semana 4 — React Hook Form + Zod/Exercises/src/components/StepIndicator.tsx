interface StepIndicatorProps {
  currentStep: number;
  steps: readonly string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="step-indicator" aria-label="Progresso do cadastro">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={step}
            className="step-item"
            aria-current={isCurrent ? 'step' : undefined}
          >
            <div
              className={[
                'step-circle',
                isCompleted ? 'completed' : '',
                isCurrent ? 'current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isCompleted ? '✓' : index + 1}
            </div>

            <span className={`step-label ${isCurrent ? 'active' : ''}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
