import { useEffect, useState } from 'react';
import { type Task } from '../types/Task';

interface UseTasksReturn {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearAllTasks: () => void;
  clearError: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);

          if (Array.isArray(parsedTasks)) {
            const validTasks = parsedTasks
              .filter(
                (task: Task) =>
                  task &&
                  typeof task.id === 'string' &&
                  typeof task.title === 'string' &&
                  typeof task.completed === 'boolean' &&
                  task.createdAt
              )
              .map((task: Task) => ({
                ...task,
                createdAt: new Date(task.createdAt),
              }))
              .filter((task: Task) => !isNaN(task.createdAt.getTime())); 

            setTasks(validTasks);
          } else {
            console.warn('Invalid tasks data in localStorage, starting fresh');
            setTasks([]);
          }
        }
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        setError('Failed to load tasks from storage. Starting fresh.');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
        setError('Failed to save tasks to storage.');
      }
    }
  }, [tasks, isLoading]);

  const addTask = (title: string) => {
    if (title.trim() === '') {
      setError('Task title cannot be empty.');
      return;
    }

    if (title.trim().length > 200) {
      setError('Task title is too long. Please keep it under 200 characters.');
      return;
    }

    try {
      setError(null);
      const newTask: Task = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: title.trim(),
        completed: false,
        createdAt: new Date(),
      };

      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const toggleTask = (id: string) => {
    try {
      setError(null);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTask = (id: string) => {
    try {
      setError(null);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const clearAllTasks = () => {
    try {
      setError(null);
      setTasks([]);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      setError('Failed to clear tasks. Please try again.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    clearAllTasks,
    clearError,
    isLoading,
    error,
  };
};
