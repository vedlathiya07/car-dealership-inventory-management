import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const TestComponent = () => {
    const { user, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="user">{user ? user.email : 'guest'}</span>
            <button onClick={() => login('token123', { email: 'test@example.com', role: 'USER' })}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext and ProtectedRoute', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('AuthContext', () => {
        it('should provide default guest user and support login/logout', () => {
            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('user')).toHaveTextContent('guest');

            fireEvent.click(screen.getByText('Login'));
            expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

            fireEvent.click(screen.getByText('Logout'));
            expect(screen.getByTestId('user')).toHaveTextContent('guest');
        });
    });

    describe('ProtectedRoute', () => {
        it('should redirect unauthenticated users to /login', () => {
            render(
                <AuthProvider>
                    <MemoryRouter initialEntries={['/protected']}>
                        <Routes>
                            <Route path="/login" element={<span>Login Page</span>} />
                            <Route
                                path="/protected"
                                element={
                                    <ProtectedRoute>
                                        <span>Protected Content</span>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            );

            expect(screen.getByText('Login Page')).toBeInTheDocument();
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should render children for authenticated users', () => {
            sessionStorage.setItem('token', 'token123');
            sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));

            render(
                <AuthProvider>
                    <MemoryRouter initialEntries={['/protected']}>
                        <Routes>
                            <Route path="/login" element={<span>Login Page</span>} />
                            <Route
                                path="/protected"
                                element={
                                    <ProtectedRoute>
                                        <span>Protected Content</span>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </MemoryRouter>
                </AuthProvider>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
            expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
        });
    });
});
