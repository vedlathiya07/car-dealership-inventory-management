import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
    it('should render all filter inputs and search button', () => {
        render(<SearchBar onSearch={() => { }} />);

        expect(screen.getByPlaceholderText(/make/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/model/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/category/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/min price/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/max price/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should call onSearch with the entered query parameters on submit', () => {
        const handleSearch = vi.fn();
        render(<SearchBar onSearch={handleSearch} />);

        fireEvent.change(screen.getByPlaceholderText(/make/i), { target: { value: 'Toyota' } });
        fireEvent.change(screen.getByPlaceholderText(/model/i), { target: { value: 'Camry' } });
        fireEvent.change(screen.getByPlaceholderText(/category/i), { target: { value: 'Sedan' } });
        fireEvent.change(screen.getByPlaceholderText(/min price/i), { target: { value: '15000' } });
        fireEvent.change(screen.getByPlaceholderText(/max price/i), { target: { value: '30000' } });

        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        expect(handleSearch).toHaveBeenCalledWith({
            make: 'Toyota',
            model: 'Camry',
            category: 'Sedan',
            minPrice: '15000',
            maxPrice: '30000'
        });
    });

    it('should call onSearch with empty parameters when reset is clicked', () => {
        const handleSearch = vi.fn();
        render(<SearchBar onSearch={handleSearch} />);

        fireEvent.change(screen.getByPlaceholderText(/make/i), { target: { value: 'Toyota' } });
        fireEvent.click(screen.getByRole('button', { name: /reset/i }));

        expect(screen.getByPlaceholderText(/make/i).value).toBe('');
        expect(handleSearch).toHaveBeenCalledWith({
            make: '',
            model: '',
            category: '',
            minPrice: '',
            maxPrice: ''
        });
    });
});
