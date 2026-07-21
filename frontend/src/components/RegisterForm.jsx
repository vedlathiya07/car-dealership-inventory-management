import { useState } from 'react';

export default function RegisterForm({ onRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError('All fields are required');
            return;
        }

        setError('');
        if (onRegister) {
            onRegister({ email, password });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Register Account</h2>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
            >
                Register
            </button>
        </form>
    );
}
