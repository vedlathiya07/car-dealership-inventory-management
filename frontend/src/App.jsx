import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SearchBar from './components/SearchBar';
import AdminControls from './components/AdminControls';
import { useState, useEffect } from 'react';

function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-90 transition">
          🚘 AutoInventory
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {user.email} ({user.role})
          </span>
          <button
            onClick={logout}
            className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-md border border-red-200 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function MainDashboard() {
  const { user, token } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

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

  const fetchFilteredVehicles = async (filters = searchFilters) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.make) queryParams.append('make', filters.make);
      if (filters.model) queryParams.append('model', filters.model);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);

      const url = `http://localhost:4000/api/vehicles/search?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFilteredVehicles();
    }
  }, [token]);

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    fetchFilteredVehicles(filters);
  };

  const handleVehicleAction = () => {
    fetchFilteredVehicles();
  };

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

      const updated = await res.json();
      setVehicles(prev => prev.map(v => v._id === vehicleId ? updated : v));
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

      const updated = await res.json();
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicleId ? updated : v))
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

      const updated = await res.json();
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicleId ? updated : v))
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

  const isSearchActive = !!(
    searchFilters.make.trim() ||
    searchFilters.model.trim() ||
    searchFilters.category.trim() ||
    searchFilters.minPrice ||
    searchFilters.maxPrice
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <SearchBar onSearch={handleSearch} />
      {!isSearchActive && <AdminControls onVehicleAction={handleVehicleAction} />}

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Loading inventory...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500 font-medium">Error: {error}</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-dashed rounded-xl">
          <p className="text-gray-400 text-lg font-medium">No vehicles match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const isEditing = editingVehicleId === vehicle._id;

            if (isEditing) {
              return (
                <div key={vehicle._id} className="bg-white border rounded-xl p-6 flex flex-col justify-between border-blue-500 shadow-md">
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
              <div key={vehicle._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between p-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {vehicle.make} {vehicle.model}
                    </h2>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
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
                      {vehicle.quantity > 0 ? `${vehicle.quantity} available` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchase(vehicle._id)}
                    disabled={vehicle.quantity <= 0}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 ${vehicle.quantity > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
    </main>
  );
}

function AuthPage({ isLogin }) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (credentials) => {
    setServerError('');
    setSuccessMsg('');
    const endpoint = isLogin ? 'login' : 'register';

    try {
      const res = await fetch(`http://localhost:4000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        login(data.token, data.user);
      } else {
        setSuccessMsg('Registration successful! Please login.');
      }
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="min-h-[80svh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to={isLogin ? '/register' : '/login'}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'create a new account' : 'sign in to existing account'}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          {serverError && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm text-center font-medium">
              {serverError}
            </div>
          )}
          {successMsg && (
            <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md text-sm text-center font-medium">
              {successMsg}
            </div>
          )}

          {isLogin ? (
            <LoginForm onLogin={handleAuth} />
          ) : (
            <RegisterForm onRegister={handleAuth} />
          )}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <AuthPage isLogin={true} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <AuthPage isLogin={false} />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
