import { act, renderHook, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('carrega apenas tarefas válidas do localStorage', async () => {
    localStorage.setItem(
      'tasks',
      JSON.stringify([
        { id: '1', title: 'Tarefa válida', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
        { id: 2, title: 'Inválida', completed: false, createdAt: '2025-01-01T00:00:00.000Z' },
        { id: '3', title: 'Data inválida', completed: false, createdAt: 'data-inválida' },
      ])
    );

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({ id: '1', title: 'Tarefa válida', completed: false });
    expect(result.current.tasks[0].createdAt).toBeInstanceOf(Date);
  });

  test('informa erro quando os dados salvos não são JSON válido', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('tasks', 'inválido');

    const { result } = renderHook(() => useTasks());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tasks).toEqual([]);
    expect(result.current.error).toBe('Failed to load tasks from storage. Starting fresh.');
  });

  test('adiciona uma tarefa com o título sem espaços externos', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addTask('  Estudar testes  '));

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({ title: 'Estudar testes', completed: false });
    expect(result.current.tasks[0].createdAt).toBeInstanceOf(Date);
  });

  test('valida título vazio e título com mais de 200 caracteres', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addTask('   '));
    expect(result.current.error).toBe('Task title cannot be empty.');

    act(() => result.current.addTask('a'.repeat(201)));
    expect(result.current.error).toBe('Task title is too long. Please keep it under 200 characters.');

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
    expect(result.current.tasks).toEqual([]);
  });

  test('alterna, exclui e limpa tarefas', async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.addTask('Primeira');
      result.current.addTask('Segunda');
    });
    const firstId = result.current.tasks[0].id;
    const secondId = result.current.tasks[1].id;

    act(() => result.current.toggleTask(firstId));
    expect(result.current.tasks[0].completed).toBe(true);

    act(() => result.current.deleteTask(secondId));
    expect(result.current.tasks.map((task) => task.id)).toEqual([firstId]);

    act(() => result.current.clearAllTasks());
    expect(result.current.tasks).toEqual([]);
  });

  test('salva as alterações no localStorage', async () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    setItem.mockClear();

    act(() => result.current.addTask('Persistir tarefa'));

    await waitFor(() => expect(setItem).toHaveBeenCalled());
    const savedTasks = JSON.parse(setItem.mock.calls.at(-1)?.[1] ?? '[]');
    expect(savedTasks).toHaveLength(1);
    expect(savedTasks[0].title).toBe('Persistir tarefa');
  });
});
