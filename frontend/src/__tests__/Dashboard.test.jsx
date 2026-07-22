import { render, screen } from '@testing-library/react';
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
});
