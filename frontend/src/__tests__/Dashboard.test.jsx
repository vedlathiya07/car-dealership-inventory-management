import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Dashboard from '../components/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

describe('Dashboard Component', () => {
    beforeEach(() => {
        sessionStorage.setItem('token', 'token123');
        sessionStorage.setItem('user', JSON.stringify({ email: 'user@example.com', role: 'USER' }));
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        sessionStorage.clear();
    });

    it('should fetch and render the list of vehicles', async () => {
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 },
            { _id: '2', make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        // Verify it calls fetch to get vehicles
        expect(global.fetch).toHaveBeenCalled();

        // Check if both vehicle cards are rendered
        expect(await screen.findByText(/Toyota Camry/i)).toBeInTheDocument();
        expect(screen.getByText(/Honda Civic/i)).toBeInTheDocument();
        expect(screen.getByText(/\$25,000/i)).toBeInTheDocument();
    });

    it('should show "No vehicles found" message if the inventory is empty', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText(/no vehicles found/i)).toBeInTheDocument();
    });

    it('should disable the purchase button if quantity is 0', async () => {
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 0 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const purchaseBtn = await screen.findByRole('button', { name: /purchase/i });
        expect(purchaseBtn).toBeDisabled();
    });

    it('should decrement the quantity when purchase is clicked successfully', async () => {
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 3 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockVehicles[0], quantity: 2 })
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const purchaseBtn = await screen.findByRole('button', { name: /purchase/i });
        expect(purchaseBtn).toBeEnabled();

        fireEvent.click(purchaseBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(screen.getByText(/2 available/i)).toBeInTheDocument();
        });
    });

    it('should show Edit and Delete buttons for ADMIN but not for USER', async () => {
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        const { unmount } = render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText(/Toyota Camry/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

        unmount();

        // Log in as ADMIN
        sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        expect(await screen.findByText(/Toyota Camry/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should delete a vehicle and call delete API when Delete is clicked by admin', async () => {
        sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Vehicle deleted successfully' })
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const deleteBtn = await screen.findByRole('button', { name: /delete/i });
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/vehicles/1', expect.objectContaining({
                method: 'DELETE',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer token123'
                })
            }));
            expect(screen.queryByText(/Toyota Camry/i)).not.toBeInTheDocument();
        });
    });

    it('should show form and call PUT API when Edit and Save are clicked by admin', async () => {
        sessionStorage.setItem('user', JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }));
        const mockVehicles = [
            { _id: '1', make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ _id: '1', make: 'Toyota', model: 'Camry Hybrid', category: 'Sedan', price: 25000, quantity: 5 })
        });

        render(
            <AuthProvider>
                <MemoryRouter>
                    <Dashboard />
                </MemoryRouter>
            </AuthProvider>
        );

        const editBtn = await screen.findByRole('button', { name: /edit/i });
        fireEvent.click(editBtn);

        // Input fields should appear inline
        const modelInput = screen.getByDisplayValue('Camry');
        fireEvent.change(modelInput, { target: { value: 'Camry Hybrid' } });

        const saveBtn = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/api/vehicles/1', expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({
                    make: 'Toyota',
                    model: 'Camry Hybrid',
                    category: 'Sedan',
                    price: 25000,
                    quantity: 5
                })
            }));
            expect(screen.getByText(/Toyota Camry Hybrid/i)).toBeInTheDocument();
        });
    });
});
