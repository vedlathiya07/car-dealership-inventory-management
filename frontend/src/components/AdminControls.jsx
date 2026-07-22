import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

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
            const res = await fetch(`${API_URL}/api/vehicles`, {
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
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">Add New Vehicle</h2>

            {error && <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm text-center font-medium">{error}</div>}
            {success && <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm text-center font-medium">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Make</label>
                        <input
                            type="text"
                            placeholder="Make"
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Model</label>
                        <input
                            type="text"
                            placeholder="Model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                        aria-label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition"
                    >
                        <option value="">Select Category</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Truck">Truck</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Convertible">Convertible</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price ($)</label>
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quantity</label>
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition duration-150 text-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Add Vehicle
                </button>
            </form>
        </div>
    );
}
