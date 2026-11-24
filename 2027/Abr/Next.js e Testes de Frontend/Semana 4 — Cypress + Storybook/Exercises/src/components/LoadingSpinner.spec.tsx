import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renderiza a mensagem de carregamento', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });
});
