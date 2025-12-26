import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './index';
import { MemoryRouter } from 'react-router-dom';

describe('LoginForm', () => {
    it('renders login form correctly', () => {
        render(
            <MemoryRouter>
                <LoginForm title="Login Teste" role="user" />
            </MemoryRouter>
        );

        expect(screen.getByText('Login Teste')).toBeInTheDocument();
        expect(screen.getByLabelText(/Nome \/ Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Palavra-passe/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });

    it('shows error message on failed login', async () => {
        // Mock do fetch para retornar erro
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ auth: false, message: 'Credenciais inválidas.' }),
            })
        );

        render(
            <MemoryRouter>
                <LoginForm title="Login Teste" role="user" />
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/Nome \/ Email/i);
        const passwordInput = screen.getByLabelText(/Palavra-passe/i);
        const submitButton = screen.getByRole('button', { name: /Entrar/i });

        fireEvent.change(emailInput, { target: { value: 'errado' } });
        fireEvent.change(passwordInput, { target: { value: 'errado' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Credenciais inválidas/i)).toBeInTheDocument();
        });
    });
});
