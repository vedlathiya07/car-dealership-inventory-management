import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminControls({ onVehicleAction }) {
    const { user, token } = useAuth();

    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!make.trim() || !model.trim() || !category.trim() || !price || !quantity) {
            setError('All fields are required');
            return;
        }

        setError('');
        setSuccess('');

        try {
            const res = await fetch('http://localhost:4000/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    make,
                    model,
                    category,
                    price: Number(price),
                    quantity: Number(quantity)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add vehicle');
            }

            setSuccess('Vehicle added successfully!');
            setMake('');
            setModel('');
            setCategory('');
            setPrice('');
            setQuantity('');

            if (onVehicleAction) {
                onVehicleAction();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-white border rounded-lg p-6 max-w-lg mx-auto mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Add New Vehicle</h2>

            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                        <input
                            type="text"
                            placeholder="Make"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <input
                            type="text"
                            placeholder="Model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition text-sm"
                >
                    Add Vehicle
                </button>
            </form>
        </div>
    );
}
