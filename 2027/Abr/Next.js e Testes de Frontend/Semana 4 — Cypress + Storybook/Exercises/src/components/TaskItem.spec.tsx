import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: '999',
    title: 'Assistir a playlist de testes do Manual do Front',
    completed: false,
    createdAt: new Date()
  };

  const mockOnDelete = jest.fn();
  const mockOnToggle = jest.fn();

  test('renderiza título da tarefa', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggle={mockOnToggle} 
      />
    );

    const title = screen.getByText('Assistir a playlist de testes do Manual do Front'); 
    expect(title).toBeInTheDocument();
  });

  test('chama onToggle quando checkbox é clicado', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskItem 
        task={mockTask}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    );

    const checkbox = screen.getByRole('checkbox', { 
      name: mockTask.title
    });
    
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith("999"); 
  });

  test('chama onDelete quando botão deletar é clicado', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskItem 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggle={mockOnToggle} 
      />
    );

    const deleteButton = screen.getByRole('button', { 
      name: /Delete task/i 
    });
    
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('999');
  });

  describe('classe completed', () => {
    test('aplica classe completed quando tarefa está completa', () => {
      const completedTask = {
        ...mockTask,
        completed: true
      };
      
      render(
        <TaskItem 
          task={completedTask} 
          onDelete={mockOnDelete} 
          onToggle={mockOnToggle} 
        />
      );

      const title = screen.getByText(mockTask.title);
      expect(title).toHaveClass('line-through text-gray-500');
    });
    
    test('NÃO aplica classe completed quando tarefa não está completa', () => {
      render(
        <TaskItem 
        task={mockTask} 
        onDelete={mockOnDelete} 
        onToggle={mockOnToggle} 
        />
      );
      
      const title = screen.getByText(mockTask.title);
      expect(title).not.toHaveClass('line-through text-gray-500');
      expect(title).toHaveClass('text-gray-800');
    });
  })
});