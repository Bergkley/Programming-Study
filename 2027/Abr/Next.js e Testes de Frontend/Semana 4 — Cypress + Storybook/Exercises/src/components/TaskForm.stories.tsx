import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TaskForm } from './TaskForm';

const meta = {
  title: 'Components/TaskForm',
  component: TaskForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Formulário controlado para criar tarefas. O botão permanece desabilitado enquanto o título está vazio e o campo é limpo após um envio válido.',
      },
    },
  },
  args: {
    onAddTask: fn(),
  },
} satisfies Meta<typeof TaskForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
