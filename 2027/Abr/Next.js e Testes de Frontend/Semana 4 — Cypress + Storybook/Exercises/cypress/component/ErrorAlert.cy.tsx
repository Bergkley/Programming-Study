import { mount } from 'cypress/react';
import { ErrorAlert } from '../../src/components/ErrorAlert';

describe('ErrorAlert', () => {
  it('não renderiza conteúdo sem uma mensagem', () => {
    mount(<ErrorAlert error={null} onDismiss={cy.stub()} />);

    cy.get('[data-cy-root]').should('be.empty');
  });

  it('exibe a mensagem e permite dispensar o alerta', () => {
    const onDismiss = cy.stub().as('onDismiss');
    mount(<ErrorAlert error="Failed to save tasks." onDismiss={onDismiss} />);

    cy.contains('Error').should('be.visible');
    cy.contains('Failed to save tasks.').should('be.visible');
    cy.get('button').click();
    cy.get('@onDismiss').should('have.been.calledOnce');
  });
});
