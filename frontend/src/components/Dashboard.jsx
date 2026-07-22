import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { token } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                    {vehicles.map((vehicle) => (
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
