import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../components/LoginForm';

describe('LoginForm Component', () => {
    it('should render email and password input fields and submit button', () => {
        render(<LoginForm onLogin={() => { }} />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should show validation error when submitted with empty fields', async () => {
        render(<LoginForm onLogin={() => { }} />);

        const submitBtn = screen.getByRole('button', { name: /login/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
    });

    it('should call onLogin with email and password when submitted with valid input', async () => {
        const handleLogin = vi.fn();
        render(<LoginForm onLogin={handleLogin} />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(handleLogin).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'password123'
        });
    });
});
