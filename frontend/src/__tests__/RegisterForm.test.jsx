import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterForm from '../components/RegisterForm';

describe('RegisterForm Component', () => {
    it('should render email and password input fields and submit button', () => {
        render(<RegisterForm onRegister={() => { }} />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should show validation error when submitted with empty fields', async () => {
        render(<RegisterForm onRegister={() => { }} />);

        const submitBtn = screen.getByRole('button', { name: /register/i });
        fireEvent.click(submitBtn);

        expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
    });

    it('should call onRegister with email and password when submitted with valid input', async () => {
        const handleRegister = vi.fn();
        render(<RegisterForm onRegister={handleRegister} />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        expect(handleRegister).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'password123'
        });
    });
});
