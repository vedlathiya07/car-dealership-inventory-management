import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminControls from '../components/AdminControls';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

describe('AdminControls Component', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
    });

    it('should NOT render admin controls or forms if the user is not an admin', () => {
        sessionStorage.setItem('token', 'token123');
        sessionStorage.setItem('user', JSON.stringify({ email: 'user@example.com', role: 'USER' }));

        render(
            <AuthProvider>
                <MemoryRouter>
                    <AdminControls onVehicleAction={() => { }} />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.queryByText(/add new vehicle/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument();
    });

    it('should render add vehicle form and list management when the user is an admin', async () => {
        sessionStorage.setItem('token', 'token123');
        sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));

        render(
            <AuthProvider>
                <MemoryRouter>
                    <AdminControls onVehicleAction={() => { }} />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(screen.getByText(/add new vehicle/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/make/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
    });

    it('should call API to add vehicle when add form is submitted by admin', async () => {
        sessionStorage.setItem('token', 'token123');
        sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));

        const mockNewVehicle = { _id: '1', make: 'Toyota', model: 'Supra', category: 'Coupe', price: 50000, quantity: 1 };
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNewVehicle
        });

        const handleVehicleAction = vi.fn();

        render(
            <AuthProvider>
                <MemoryRouter>
                    <AdminControls onVehicleAction={handleVehicleAction} />
                </MemoryRouter>
            </AuthProvider>
        );

        fireEvent.change(screen.getByPlaceholderText(/make/i), { target: { value: 'Toyota' } });
        fireEvent.change(screen.getByPlaceholderText(/model/i), { target: { value: 'Supra' } });
        fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'Coupe' } });
        fireEvent.change(screen.getByPlaceholderText(/price/i), { target: { value: '50000' } });
        fireEvent.change(screen.getByPlaceholderText(/quantity/i), { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/vehicles', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer token123'
                }),
                body: expect.any(FormData)
            }));
            expect(handleVehicleAction).toHaveBeenCalled();
        });
    });
});
