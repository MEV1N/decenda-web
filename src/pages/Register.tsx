import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', { username, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-md shadow-[0_0_15px_rgba(139,0,0,0.1)]">
                <h2 className="text-2xl font-bold text-accent mb-6 text-center tracking-widest uppercase">Request Clearance</h2>
                {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        className="bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-accent font-mono text-sm"
                        type="text"
                        placeholder="Desired Agent ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-accent font-mono text-sm"
                        type="password"
                        placeholder="Passcode"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="mt-2 text-white font-bold py-3 rounded tracking-wide transition-colors uppercase border border-accent hover:bg-accent hover:bg-opacity-20 glow-hover">
                        Submit Request
                    </button>
                </form>
                <p className="mt-6 text-center text-dimmed text-xs">
                    Already cleared? <Link to="/login" className="text-accent hover:underline">Access Terminal</Link>
                </p>
            </div>
        </div>
    );
}
