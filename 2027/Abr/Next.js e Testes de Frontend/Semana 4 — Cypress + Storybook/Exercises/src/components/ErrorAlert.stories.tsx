import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorAlert } from './ErrorAlert';

const meta = {
  title: 'Components/ErrorAlert',
  component: ErrorAlert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Alerta para falhas de leitura ou gravação. Quando não existe mensagem de erro, o componente não produz conteúdo visual.',
      },
    },
  },
  args: {
    onDismiss: fn(),
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
  args: {
    error: 'Failed to save tasks to storage.',
  },
};

export const Hidden: Story = {
  args: {
    error: null,
  },
};
