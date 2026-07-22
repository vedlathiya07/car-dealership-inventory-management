import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Inline edit state
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [editMake, setEditMake] = useState('');
    const [editModel, setEditModel] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editQuantity, setEditQuantity] = useState('');

    // Restock state
    const [restockAmounts, setRestockAmounts] = useState({});

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/vehicles', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch vehicles');
                }

                const data = await res.json();
                setVehicles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchVehicles();
        }
    }, [token]);

    const handlePurchase = async (vehicleId) => {
        try {
            const res = await fetch(`http://localhost:4000/api/vehicles/${vehicleId}/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Purchase failed');
            }

            const updatedVehicle = await res.json();

            // Update the vehicle's state locally
            setVehicles((prev) =>
                prev.map((v) => (v._id === vehicleId ? updatedVehicle : v))
            );
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRestock = async (vehicleId) => {
        const quantity = restockAmounts[vehicleId] || 1;
        try {
            const res = await fetch(`http://localhost:4000/api/vehicles/${vehicleId}/restock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: Number(quantity) })
            });

            if (!res.ok) {
                throw new Error('Restock failed');
            }

            const updatedVehicle = await res.json();
            setVehicles((prev) =>
                prev.map((v) => (v._id === vehicleId ? updatedVehicle : v))
            );
            setRestockAmounts((prev) => ({ ...prev, [vehicleId]: '' }));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleStartEdit = (vehicle) => {
        setEditingVehicleId(vehicle._id);
        setEditMake(vehicle.make);
        setEditModel(vehicle.model);
        setEditCategory(vehicle.category);
        setEditPrice(vehicle.price);
        setEditQuantity(vehicle.quantity);
    };

    const handleCancelEdit = () => {
        setEditingVehicleId(null);
    };

    const handleSaveEdit = async (e, vehicleId) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:4000/api/vehicles/${vehicleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    make: editMake,
                    model: editModel,
                    category: editCategory,
                    price: Number(editPrice),
                    quantity: Number(editQuantity)
                })
            });

            if (!res.ok) {
                throw new Error('Failed to update vehicle');
            }

            const updatedVehicle = await res.json();
            setVehicles((prev) =>
                prev.map((v) => (v._id === vehicleId ? updatedVehicle : v))
            );
            setEditingVehicleId(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (vehicleId) => {
        try {
            const res = await fetch(`http://localhost:4000/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to delete vehicle');
            }

            setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <div className="text-center mt-10 text-gray-600">Loading inventory...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Car Dealership Inventory</h1>

            {vehicles.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 border rounded-lg">
                    <p className="text-gray-500 text-lg">No vehicles found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => {
                        const isEditing = editingVehicleId === vehicle._id;

                        if (isEditing) {
                            return (
                                <div key={vehicle._id} className="bg-white border rounded-lg p-5 flex flex-col justify-between border-blue-500 shadow-md">
                                    <form onSubmit={(e) => handleSaveEdit(e, vehicle._id)} className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Make</label>
                                            <input
                                                type="text"
                                                value={editMake}
                                                onChange={(e) => setEditMake(e.target.value)}
                                                className="w-full px-2.5 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Model</label>
                                            <input
                                                type="text"
                                                value={editModel}
                                                onChange={(e) => setEditModel(e.target.value)}
                                                className="w-full px-2.5 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                                            <select
                                                aria-label="Category"
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="w-full px-2.5 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                                required
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
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price</label>
                                                <input
                                                    type="number"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={editQuantity}
                                                    onChange={(e) => setEditQuantity(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex-1 py-1.5 border text-gray-600 rounded text-sm font-semibold hover:bg-gray-100 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-1.5 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            );
                        }

                        return (
                            <div key={vehicle._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {vehicle.make} {vehicle.model}
                                        </h2>
                                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase">
                                            {vehicle.category}
                                        </span>
                                    </div>
                                    <p className="text-2xl font-extrabold text-blue-600 mb-4">
                                        ${vehicle.price.toLocaleString()}
                                    </p>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="text-gray-500">In Stock:</span>
                                        <span className={`font-bold ${vehicle.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {vehicle.quantity} available
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handlePurchase(vehicle._id)}
                                        disabled={vehicle.quantity <= 0}
                                        className={`w-full py-2 rounded-md font-semibold text-sm transition ${vehicle.quantity > 0
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Purchase
                                    </button>

                                    {user?.role === 'ADMIN' && (
                                        <div className="mt-4 border-t pt-3 space-y-2">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Amt"
                                                    value={restockAmounts[vehicle._id] || ''}
                                                    onChange={(e) => setRestockAmounts({ ...restockAmounts, [vehicle._id]: e.target.value })}
                                                    className="w-20 px-2.5 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleRestock(vehicle._id)}
                                                    className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition"
                                                >
                                                    Restock
                                                </button>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                                <button
                                                    onClick={() => handleStartEdit(vehicle)}
                                                    className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vehicle._id)}
                                                    className="flex-1 py-1.5 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
