import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorAlert } from './ErrorAlert';

describe('ErrorAlert', () => {
  test('não renderiza quando não há erro', () => {
    const { container } = render(<ErrorAlert error={null} onDismiss={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('renderiza a mensagem de erro', () => {
    render(<ErrorAlert error='Falha ao salvar tarefa.' onDismiss={jest.fn()} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Falha ao salvar tarefa.')).toBeInTheDocument();
  });

  test('chama onDismiss ao clicar no botão', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    render(<ErrorAlert error='Erro' onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
