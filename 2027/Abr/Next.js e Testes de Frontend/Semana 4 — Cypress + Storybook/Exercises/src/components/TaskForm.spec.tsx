import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockOnAddTask = jest.fn();

  beforeEach(() => {
    mockOnAddTask.mockClear();
  });

  describe('Renderização', () => {
    test('renderiza input e botão', () => {
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button', { name: /add task/i });

      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('input começa vazio', () => {
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      expect(input).toHaveValue('');
    });
  });

  describe('Interação com input', () => {
    test('permite digitar no campo', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      
      await user.type(input, 'Comprar café');

      expect(input).toHaveValue('Comprar café');
    });
  });

  describe('Validação do botão', () => {
    test('botão começa desabilitado quando campo vazio', () => {
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const button = screen.getByRole('button', { name: /add task/i });
      expect(button).toBeDisabled();
    });

    test('botão habilita quando digita texto', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button');
      
      await user.type(input, 'Nova tarefa');

      expect(button).toBeEnabled();
    });

    test('botão permanece desabilitado se campo só tem espaços', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button');
      
      await user.type(input, '   ');

      expect(button).toBeDisabled();
    });
  });

  describe('Submit com sucesso', () => {
    test('chama onAddTask com texto válido', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button');
      
      await user.type(input, 'Estudar React');
      await user.click(button);

      expect(mockOnAddTask).toHaveBeenCalledTimes(1);
      expect(mockOnAddTask).toHaveBeenCalledWith('Estudar React');
    });

    test('limpa campo após adicionar', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button');
      
      await user.type(input, 'Nova tarefa');
      await user.click(button);

      expect(input).toHaveValue('');
    });

    test('NÃO chama onAddTask quando campo está vazio', async () => {
      const user = userEvent.setup();
      render(<TaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      const button = screen.getByRole('button');
      
      await user.type(input, '{Enter}');
      await user.click(button);

      expect(mockOnAddTask).not.toHaveBeenCalled();
    });
  });
});